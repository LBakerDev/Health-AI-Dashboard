import type {
  DataQualitySignal,
  DailyActivityPoint,
  HealthMetric,
  HeartRateZone,
  ImportSummary,
  MetricUnit,
  Mvp1DashboardPayload,
  SourceSystem,
  TimeSeriesPoint,
  TrendSignal,
  WorkoutSession,
  WorkoutType,
} from '@entities/health-metric';

export interface ImportProgress {
  label: string;
  progress: number;
}

export interface ImportHealthDataResult {
  payload: Mvp1DashboardPayload;
  warnings: string[];
}

interface ParseOptions {
  fileName: string;
  importedAt?: string;
}

interface ParsedHealthRecord {
  endDate: Date;
  source: SourceSystem;
  startDate: Date;
  type: string;
  value: number;
}

interface ParsedWorkout {
  activeCalories: number;
  averageHeartRate: number | null;
  durationMinutes: number;
  id: string;
  label: string;
  maxHeartRate: number | null;
  source: SourceSystem;
  startedAt: Date;
  type: WorkoutType;
}

type AttributeMap = Record<string, string | undefined>;

interface ParseContext {
  deduplicatedRecords: ParsedHealthRecord[];
  fileName: string;
  importedAt: string;
  recordsDeduplicated: number;
  recordsRead: number;
  workouts: ParsedWorkout[];
}

const SOURCE_PRIORITY = ['peloton', 'apple-watch', 'iphone', 'manual', 'sample'] as const;
const STORAGE_KEY = 'health-ai-dashboard:mvp1-payload';

const MVP1_RECORD_TYPES = new Set([
  'HKQuantityTypeIdentifierStepCount',
  'HKQuantityTypeIdentifierActiveEnergyBurned',
  'HKQuantityTypeIdentifierBodyMass',
  'HKQuantityTypeIdentifierRestingHeartRate',
  'HKQuantityTypeIdentifierVO2Max',
  'HKQuantityTypeIdentifierHeartRate',
]);

const IMPORT_PROGRESS = {
  reading: { label: 'Reading Apple Health export...', progress: 14 },
  extracting: { label: 'Preparing local export...', progress: 28 },
  parsing: { label: 'Extracting MVP health records...', progress: 48 },
  aggregating: { label: 'Aggregating daily and weekly rollups...', progress: 72 },
  insight: { label: 'Preparing the weekly insight...', progress: 91 },
  ready: { label: 'Dashboard ready.', progress: 100 },
} satisfies Record<string, ImportProgress>;

export async function importHealthDataFile(
  file: File,
  onProgress: (progress: ImportProgress) => void,
): Promise<ImportHealthDataResult> {
  if (!isSupportedAppleHealthFile(file)) {
    throw new Error('Choose an Apple Health export.zip or export.xml file.');
  }

  onProgress(IMPORT_PROGRESS.reading);
  const buffer = await file.arrayBuffer();

  onProgress(IMPORT_PROGRESS.extracting);
  const xml = file.name.toLowerCase().endsWith('.zip')
    ? await readExportXmlFromZip(new Uint8Array(buffer))
    : await file.text();

  onProgress(IMPORT_PROGRESS.parsing);
  const payload = parseAppleHealthExportXml(xml, { fileName: file.name });

  onProgress(IMPORT_PROGRESS.aggregating);
  await waitForPaint();

  onProgress(IMPORT_PROGRESS.insight);
  await waitForPaint();

  onProgress(IMPORT_PROGRESS.ready);

  return {
    payload,
    warnings: payload.importSummary.dataQuality
      .filter((signal) => signal.status !== 'good')
      .map((signal) => signal.detail),
  };
}

export function parseAppleHealthExportXml(
  xml: string,
  { fileName, importedAt = new Date().toISOString() }: ParseOptions,
): Mvp1DashboardPayload {
  if (!xml.includes('<HealthData')) {
    throw new Error('This file is not valid Apple Health XML.');
  }

  const recordAttributes = Array.from(xml.matchAll(/<Record\b([^>]*)\/?>/g), (match) =>
    parseAttributes(match[1]),
  );
  const workoutAttributes = Array.from(xml.matchAll(/<Workout\b([^>]*)>/g), (match) =>
    parseAttributes(match[1]),
  );
  const parsedRecords = recordAttributes
    .map(parseHealthRecord)
    .filter((record): record is ParsedHealthRecord => Boolean(record));
  const deduplicatedRecords = dedupeRecords(parsedRecords);
  const workouts = workoutAttributes
    .map(parseWorkout)
    .filter((workout): workout is ParsedWorkout => Boolean(workout));

  if (deduplicatedRecords.length === 0 && workouts.length === 0) {
    throw new Error('No MVP1 Apple Health records were found in this export.');
  }

  return buildDashboardPayload({
    deduplicatedRecords,
    fileName,
    importedAt,
    recordsDeduplicated: parsedRecords.length - deduplicatedRecords.length,
    recordsRead: recordAttributes.length + workouts.length,
    workouts,
  });
}

export function readStoredDashboardPayload() {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedPayload = window.localStorage.getItem(STORAGE_KEY);

  if (!storedPayload) {
    return null;
  }

  try {
    const payload = JSON.parse(storedPayload) as Mvp1DashboardPayload;

    return payload.schemaVersion === 'mvp1.0' ? payload : null;
  } catch {
    return null;
  }
}

export function writeStoredDashboardPayload(payload: Mvp1DashboardPayload) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearStoredDashboardPayload() {
  window.localStorage.removeItem(STORAGE_KEY);
}

async function readExportXmlFromZip(bytes: Uint8Array) {
  if (bytes.byteLength > 0) {
    throw new Error('ZIP import is next. For this first pass, choose export.xml from the archive.');
  }

  throw new Error('This archive does not include an Apple Health export.xml file.');
}

function isSupportedAppleHealthFile(file: File) {
  const fileName = file.name.toLowerCase();

  return fileName.endsWith('.zip') || fileName.endsWith('.xml');
}

function parseAttributes(attributeText: string) {
  const attributes: AttributeMap = {};

  attributeText.replace(/([\w:.-]+)="([^"]*)"/g, (_match, name: string, value: string) => {
    attributes[name] = decodeXmlAttribute(value);

    return '';
  });

  return attributes;
}

function decodeXmlAttribute(value: string) {
  return value
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');
}

function parseHealthRecord(attributes: AttributeMap): ParsedHealthRecord | null {
  const type = attributes.type;

  if (!type || !MVP1_RECORD_TYPES.has(type)) {
    return null;
  }

  const value = Number(attributes.value);
  const startDate = parseAppleDate(attributes.startDate);
  const endDate = parseAppleDate(attributes.endDate);

  if (!Number.isFinite(value) || !startDate || !endDate) {
    return null;
  }

  return {
    endDate,
    source: mapSourceSystem(attributes.sourceName),
    startDate,
    type,
    value: normalizeRecordValue(type, value, attributes.unit),
  };
}

function parseWorkout(attributes: AttributeMap): ParsedWorkout | null {
  const startedAt = parseAppleDate(attributes.startDate);
  const duration = Number(attributes.duration);

  if (!startedAt || !Number.isFinite(duration)) {
    return null;
  }

  const source = mapSourceSystem(attributes.sourceName);
  const workoutType = mapWorkoutType(attributes.workoutActivityType, attributes.sourceName);
  const durationMinutes = normalizeDurationMinutes(duration, attributes.durationUnit);
  const calories = Number(attributes.totalEnergyBurned);

  return {
    activeCalories: Number.isFinite(calories)
      ? normalizeEnergyCalories(calories, attributes.totalEnergyBurnedUnit)
      : 0,
    averageHeartRate: null,
    durationMinutes: Math.round(durationMinutes),
    id: `workout-${startedAt.toISOString()}-${workoutType}`,
    label: buildWorkoutLabel(workoutType),
    maxHeartRate: null,
    source,
    startedAt,
    type: workoutType,
  };
}

function dedupeRecords(records: ParsedHealthRecord[]) {
  const recordMap = new Map<string, ParsedHealthRecord>();

  records.forEach((record) => {
    const key = [
      record.type,
      record.startDate.toISOString(),
      record.endDate.toISOString(),
      record.value,
    ].join('|');
    const existingRecord = recordMap.get(key);

    if (!existingRecord || sourceRank(record.source) < sourceRank(existingRecord.source)) {
      recordMap.set(key, record);
    }
  });

  return Array.from(recordMap.values());
}

function buildDashboardPayload(context: ParseContext): Mvp1DashboardPayload {
  const latestDate = findLatestDate(context);
  const weekStart = startOfWeek(latestDate);
  const weekEnd = addDays(weekStart, 6);
  const previousWeekStart = addDays(weekStart, -7);
  const previousWeekEnd = addDays(weekStart, -1);
  const weekDates = Array.from({ length: 7 }, (_, index) => toIsoDate(addDays(weekStart, index)));
  const weekRecords = filterRecordsBetween(context.deduplicatedRecords, weekStart, weekEnd);
  const previousWeekRecords = filterRecordsBetween(
    context.deduplicatedRecords,
    previousWeekStart,
    previousWeekEnd,
  );
  const weekWorkouts = filterWorkoutsBetween(context.workouts, weekStart, weekEnd);
  const previousWeekWorkouts = filterWorkoutsBetween(
    context.workouts,
    previousWeekStart,
    previousWeekEnd,
  );
  const dailyActivity = buildDailyActivity(weekDates, weekRecords, weekWorkouts);
  const averageSteps = Math.round(sumDaily(dailyActivity, 'steps') / 7);
  const previousAverageSteps = Math.round(
    sumRecords(previousWeekRecords, 'HKQuantityTypeIdentifierStepCount') / 7,
  );
  const activeCalories = Math.round(sumDaily(dailyActivity, 'activeCalories'));
  const previousActiveCalories = Math.round(
    sumRecords(previousWeekRecords, 'HKQuantityTypeIdentifierActiveEnergyBurned'),
  );
  const weightMetric = buildWeightMetric(weekRecords, previousWeekRecords);
  const restingHeartRateMetric = buildAverageMetric({
    currentRecords: weekRecords,
    goodWhenDown: true,
    id: 'cardio.rhr.current',
    label: 'Resting HR',
    previousRecords: previousWeekRecords,
    precision: 0,
    recordType: 'HKQuantityTypeIdentifierRestingHeartRate',
    unit: 'bpm',
  });
  const vo2MaxMetric = buildLatestMetric({
    currentRecords: weekRecords,
    goodWhenDown: false,
    id: 'cardio.vo2max.current',
    label: 'VO2 max',
    previousRecords: previousWeekRecords,
    precision: 1,
    recordType: 'HKQuantityTypeIdentifierVO2Max',
    unit: 'ml/kg/min',
  });
  const heartRateMetric = buildAverageMetric({
    currentRecords: weekRecords,
    goodWhenDown: false,
    id: 'cardio.workoutHr.avg',
    label: 'Avg workout HR',
    previousRecords: previousWeekRecords,
    precision: 0,
    recordType: 'HKQuantityTypeIdentifierHeartRate',
    unit: 'bpm',
  });
  const totalWorkoutMinutes = sumWorkouts(weekWorkouts, 'durationMinutes');
  const estimatedZoneMinutes = Math.round(totalWorkoutMinutes * 0.6);
  const importSummary = buildImportSummary({
    ...context,
    estimatedZoneMinutes,
    weekRecords,
    weekWorkouts,
  });

  return {
    schemaVersion: 'mvp1.0',
    generatedAt: context.importedAt,
    importSummary,
    weeklySummary: {
      week: {
        end: toIsoDate(weekEnd),
        label: formatWeekLabel(weekStart, weekEnd),
        start: toIsoDate(weekStart),
      },
      headline: buildHeadline(restingHeartRateMetric, weightMetric, vo2MaxMetric),
      metrics: {
        activeCalories: {
          id: 'weekly.activeCalories.total',
          label: 'Active calories',
          value: activeCalories,
          unit: 'kcal',
          comparisonLabel: `${Math.round(activeCalories / 7).toLocaleString('en-US')}/day avg this week`,
          trend: buildPercentTrend(activeCalories, previousActiveCalories, false),
        },
        averageStepsPerDay: {
          id: 'weekly.steps.avg',
          label: 'Avg steps/day',
          value: averageSteps,
          unit: 'steps',
          comparisonLabel: previousAverageSteps
            ? `vs ${previousAverageSteps.toLocaleString('en-US')} last week`
            : 'current imported week',
          trend: buildPercentTrend(averageSteps, previousAverageSteps, false),
        },
        weightTrend: weightMetric,
        workoutSessions: {
          id: 'weekly.workouts.count',
          label: 'Workouts',
          value: weekWorkouts.length,
          unit: 'sessions',
          comparisonLabel: buildWorkoutComparisonLabel(weekWorkouts),
          trend: buildDeltaTrend(
            weekWorkouts.length,
            previousWeekWorkouts.length,
            'sessions',
            false,
          ),
        },
      },
      dailyActivity,
    },
    cardioFitness: {
      heartRateZones: buildEstimatedHeartRateZones(totalWorkoutMinutes),
      metrics: {
        averageWorkoutHeartRate: heartRateMetric ?? {
          id: 'cardio.workoutHr.avg',
          label: 'Avg workout HR',
          value: 0,
          unit: 'bpm',
          comparisonLabel: 'heart-rate samples unavailable',
        },
        restingHeartRate: restingHeartRateMetric,
        vo2Max: vo2MaxMetric,
        zoneTwoThreeMinutes: {
          id: 'cardio.zone23.minutes',
          label: 'Time in Zone 2/3',
          value: estimatedZoneMinutes,
          unit: 'min',
          comparisonLabel: 'estimated from workout duration',
          trend: buildDeltaTrend(estimatedZoneMinutes, 0, 'min', false),
        },
      },
      restingHeartRateTrend: buildTrendSeries(
        context.deduplicatedRecords,
        'HKQuantityTypeIdentifierRestingHeartRate',
      ),
      vo2MaxTrend: buildTrendSeries(context.deduplicatedRecords, 'HKQuantityTypeIdentifierVO2Max'),
    },
    insight: buildInsight({
      averageSteps,
      activeCalories,
      restingHeartRateMetric,
      vo2MaxMetric,
      weekWorkouts,
      weightMetric,
    }),
    workouts: weekWorkouts.map(toWorkoutSession),
  };
}

function buildDailyActivity(
  dates: string[],
  records: ParsedHealthRecord[],
  workouts: ParsedWorkout[],
): DailyActivityPoint[] {
  return dates.map((date) => ({
    activeCalories: Math.round(
      sumRecordsForDate(records, 'HKQuantityTypeIdentifierActiveEnergyBurned', date) +
        workouts
          .filter((workout) => toIsoDate(workout.startedAt) === date)
          .reduce((sum, workout) => sum + workout.activeCalories, 0),
    ),
    date,
    steps: Math.round(sumRecordsForDate(records, 'HKQuantityTypeIdentifierStepCount', date)),
    workoutMinutes: Math.round(
      workouts
        .filter((workout) => toIsoDate(workout.startedAt) === date)
        .reduce((sum, workout) => sum + workout.durationMinutes, 0),
    ),
  }));
}

function buildWeightMetric(
  weekRecords: ParsedHealthRecord[],
  previousWeekRecords: ParsedHealthRecord[],
): HealthMetric | null {
  return buildAverageMetric({
    currentRecords: weekRecords,
    goodWhenDown: true,
    id: 'weekly.weight.avg',
    label: 'Weight trend',
    previousRecords: previousWeekRecords,
    precision: 1,
    recordType: 'HKQuantityTypeIdentifierBodyMass',
    unit: 'lb',
  });
}

function buildAverageMetric({
  currentRecords,
  goodWhenDown,
  id,
  label,
  previousRecords,
  precision,
  recordType,
  unit,
}: {
  currentRecords: ParsedHealthRecord[];
  goodWhenDown: boolean;
  id: string;
  label: string;
  previousRecords: ParsedHealthRecord[];
  precision: number;
  recordType: string;
  unit: MetricUnit;
}) {
  const currentValues = currentRecords
    .filter((record) => record.type === recordType)
    .map((record) => record.value);

  if (currentValues.length === 0) {
    return null;
  }

  const previousValues = previousRecords
    .filter((record) => record.type === recordType)
    .map((record) => record.value);
  const currentAverage = average(currentValues);
  const previousAverage = previousValues.length ? average(previousValues) : 0;

  return {
    id,
    label,
    precision,
    value: roundTo(currentAverage, precision),
    unit,
    comparisonLabel: previousAverage
      ? `${goodWhenDown ? 'down' : 'vs'} from ${roundTo(previousAverage, precision)}`
      : 'from imported Apple Health records',
    trend: buildDeltaTrend(currentAverage, previousAverage, unit, goodWhenDown),
  } satisfies HealthMetric;
}

function buildLatestMetric({
  currentRecords,
  goodWhenDown,
  id,
  label,
  previousRecords,
  precision,
  recordType,
  unit,
}: {
  currentRecords: ParsedHealthRecord[];
  goodWhenDown: boolean;
  id: string;
  label: string;
  previousRecords: ParsedHealthRecord[];
  precision: number;
  recordType: string;
  unit: MetricUnit;
}) {
  const currentRecord = currentRecords
    .filter((record) => record.type === recordType)
    .sort((a, b) => b.endDate.getTime() - a.endDate.getTime())[0];

  if (!currentRecord) {
    return null;
  }

  const previousRecord = previousRecords
    .filter((record) => record.type === recordType)
    .sort((a, b) => b.endDate.getTime() - a.endDate.getTime())[0];

  return {
    id,
    label,
    precision,
    value: roundTo(currentRecord.value, precision),
    unit,
    comparisonLabel: previousRecord
      ? `vs ${roundTo(previousRecord.value, precision)} last week`
      : 'from imported Apple Health records',
    trend: buildDeltaTrend(currentRecord.value, previousRecord?.value ?? 0, unit, goodWhenDown),
  } satisfies HealthMetric;
}

function buildImportSummary({
  estimatedZoneMinutes,
  fileName,
  importedAt,
  recordsDeduplicated,
  recordsRead,
  weekRecords,
  weekWorkouts,
}: ParseContext & {
  estimatedZoneMinutes: number;
  weekRecords: ParsedHealthRecord[];
  weekWorkouts: ParsedWorkout[];
}): ImportSummary {
  const dataQuality: DataQualitySignal[] = [
    {
      detail: `${weekRecords.length.toLocaleString('en-US')} MVP1 records and ${weekWorkouts.length} workouts were included in the visible week.`,
      id: 'dq-core-records',
      label: 'Core record coverage',
      status: weekRecords.length > 0 || weekWorkouts.length > 0 ? 'good' : 'neutral',
    },
    {
      detail: recordsDeduplicated
        ? `${recordsDeduplicated.toLocaleString('en-US')} overlapping records were collapsed by source priority.`
        : 'No overlapping records were detected in the MVP1 slice.',
      id: 'dq-dedup',
      label: 'Deduped overlapping records',
      status: 'good',
    },
    {
      detail: estimatedZoneMinutes
        ? 'Zone 2/3 minutes are estimated from workout duration until workout heart-rate zone parsing is wired.'
        : 'Workout heart-rate zones were not available in this import.',
      id: 'dq-zones',
      label: 'Workout zone coverage',
      status: 'neutral',
    },
  ];

  return {
    dataQuality,
    importedAt,
    mode: 'apple-health-export',
    recordsDeduplicated,
    recordsRead,
    sourceLabel: fileName,
    sourcePriority: [...SOURCE_PRIORITY],
    status: 'ready',
  };
}

function buildInsight({
  activeCalories,
  averageSteps,
  restingHeartRateMetric,
  vo2MaxMetric,
  weekWorkouts,
  weightMetric,
}: {
  activeCalories: number;
  averageSteps: number;
  restingHeartRateMetric: HealthMetric | null;
  vo2MaxMetric: HealthMetric | null;
  weekWorkouts: ParsedWorkout[];
  weightMetric: HealthMetric | null;
}) {
  const evidenceMetricIds = [
    'weekly.steps.avg',
    'weekly.activeCalories.total',
    'weekly.workouts.count',
    weightMetric?.id,
    restingHeartRateMetric?.id,
    vo2MaxMetric?.id,
    'cardio.zone23.minutes',
  ].filter((metricId): metricId is string => Boolean(metricId));

  return {
    body: `This imported week averaged ${averageSteps.toLocaleString('en-US')} steps/day with ${activeCalories.toLocaleString('en-US')} active calories and ${weekWorkouts.length} logged workouts. ${
      restingHeartRateMetric || vo2MaxMetric || weightMetric
        ? 'Core cardio and body-composition signals are available for trend review.'
        : 'Add resting HR, VO2 max, or weight records to unlock deeper trend narration.'
    }`,
    confidence: 'medium',
    evidenceMetricIds,
    generatedFrom: 'deterministic-stats',
    title: 'Imported data is ready for review',
  } satisfies Mvp1DashboardPayload['insight'];
}

function buildHeadline(
  restingHeartRateMetric: HealthMetric | null,
  weightMetric: HealthMetric | null,
  vo2MaxMetric: HealthMetric | null,
) {
  const goodSignals = [restingHeartRateMetric, weightMetric, vo2MaxMetric].filter(
    (metric) => metric?.trend?.sentiment === 'good',
  ).length;

  if (goodSignals >= 2) {
    return 'Conditioning is improving and fat-loss progress is on track.';
  }

  if (goodSignals === 1) {
    return 'One imported trend is moving in the right direction.';
  }

  return 'Imported metrics are ready for weekly review.';
}

function buildTrendSeries(records: ParsedHealthRecord[], recordType: string): TimeSeriesPoint[] {
  const byDate = new Map<string, number[]>();

  records
    .filter((record) => record.type === recordType)
    .forEach((record) => {
      const date = toIsoDate(record.endDate);
      byDate.set(date, [...(byDate.get(date) ?? []), record.value]);
    });

  return Array.from(byDate.entries())
    .map(([date, values]) => ({ date, value: roundTo(average(values), 1) }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-12);
}

function buildEstimatedHeartRateZones(totalWorkoutMinutes: number): HeartRateZone[] {
  const distributions = [0.2, 0.4, 0.2, 0.14, 0.06];

  return distributions.map((share, index) => ({
    label: `Zone ${index + 1}`,
    minutes: Math.round(totalWorkoutMinutes * share),
    target: index === 1 || index === 2,
    zone: (index + 1) as HeartRateZone['zone'],
  }));
}

function buildWorkoutComparisonLabel(workouts: ParsedWorkout[]) {
  if (workouts.length === 0) {
    return 'no workouts in imported week';
  }

  const cardioCount = workouts.filter((workout) =>
    ['basketball', 'peloton', 'walk'].includes(workout.type),
  ).length;
  const strengthCount = workouts.filter((workout) => workout.type === 'strength').length;

  return `${cardioCount} cardio${strengthCount ? `, ${strengthCount} strength` : ''}`;
}

function buildPercentTrend(
  current: number,
  previous: number,
  goodWhenDown: boolean,
): TrendSignal | undefined {
  if (!previous) {
    return undefined;
  }

  const delta = Math.round(((current - previous) / previous) * 100);

  return {
    delta,
    direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
    label: `${delta > 0 ? '+' : ''}${delta}%`,
    sentiment: getTrendSentiment(delta, goodWhenDown),
    unit: 'percent',
  };
}

function buildDeltaTrend(
  current: number,
  previous: number,
  unit: MetricUnit,
  goodWhenDown: boolean,
): TrendSignal | undefined {
  if (!previous) {
    return undefined;
  }

  const delta = roundTo(current - previous, unit === 'lb' || unit === 'ml/kg/min' ? 1 : 0);

  return {
    delta,
    direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
    label: `${delta > 0 ? '+' : ''}${delta} ${unit}`,
    sentiment: getTrendSentiment(delta, goodWhenDown),
    unit,
  };
}

function getTrendSentiment(delta: number, goodWhenDown: boolean) {
  if (delta === 0) {
    return 'neutral';
  }

  return (goodWhenDown ? delta < 0 : delta > 0) ? 'good' : 'bad';
}

function toWorkoutSession(workout: ParsedWorkout): WorkoutSession {
  return {
    activeCalories: Math.round(workout.activeCalories),
    averageHeartRate: workout.averageHeartRate,
    durationMinutes: workout.durationMinutes,
    id: workout.id,
    label: workout.label,
    maxHeartRate: workout.maxHeartRate,
    source: workout.source,
    startedAt: workout.startedAt.toISOString(),
    type: workout.type,
  };
}

function findLatestDate({ deduplicatedRecords, workouts }: ParseContext) {
  const timestamps = [
    ...deduplicatedRecords.map((record) => record.endDate.getTime()),
    ...workouts.map((workout) => workout.startedAt.getTime()),
  ].filter(Number.isFinite);

  return new Date(Math.max(...timestamps));
}

function filterRecordsBetween(records: ParsedHealthRecord[], start: Date, end: Date) {
  const startTime = start.getTime();
  const endTime = endOfDay(end).getTime();

  return records.filter((record) => {
    const time = record.endDate.getTime();

    return time >= startTime && time <= endTime;
  });
}

function filterWorkoutsBetween(workouts: ParsedWorkout[], start: Date, end: Date) {
  const startTime = start.getTime();
  const endTime = endOfDay(end).getTime();

  return workouts.filter((workout) => {
    const time = workout.startedAt.getTime();

    return time >= startTime && time <= endTime;
  });
}

function sumRecords(records: ParsedHealthRecord[], type: string) {
  return records
    .filter((record) => record.type === type)
    .reduce((sum, record) => sum + record.value, 0);
}

function sumRecordsForDate(records: ParsedHealthRecord[], type: string, date: string) {
  return records
    .filter((record) => record.type === type && toIsoDate(record.endDate) === date)
    .reduce((sum, record) => sum + record.value, 0);
}

function sumDaily(
  dailyActivity: DailyActivityPoint[],
  key: keyof Omit<DailyActivityPoint, 'date'>,
) {
  return dailyActivity.reduce((sum, point) => sum + point[key], 0);
}

function sumWorkouts(workouts: ParsedWorkout[], key: keyof Pick<ParsedWorkout, 'durationMinutes'>) {
  return workouts.reduce((sum, workout) => sum + workout[key], 0);
}

function normalizeRecordValue(type: string, value: number, unit: string | null | undefined) {
  if (type === 'HKQuantityTypeIdentifierBodyMass' && unit === 'kg') {
    return value * 2.20462;
  }

  if (type === 'HKQuantityTypeIdentifierActiveEnergyBurned') {
    return normalizeEnergyCalories(value, unit);
  }

  return value;
}

function normalizeEnergyCalories(value: number, unit: string | null | undefined) {
  return unit?.toLowerCase() === 'kj' ? value / 4.184 : value;
}

function normalizeDurationMinutes(value: number, unit: string | null | undefined) {
  if (unit === 'sec') {
    return value / 60;
  }

  if (unit === 'hr') {
    return value * 60;
  }

  return value;
}

function parseAppleDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalizedDate = value.replace(
    /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) ([+-]\d{2})(\d{2})$/,
    '$1T$2$3:$4',
  );
  const date = new Date(normalizedDate);

  return Number.isNaN(date.getTime()) ? null : date;
}

function mapSourceSystem(sourceName: string | null | undefined): SourceSystem {
  const normalizedSourceName = sourceName?.toLowerCase() ?? '';

  if (normalizedSourceName.includes('peloton')) {
    return 'peloton';
  }

  if (normalizedSourceName.includes('watch')) {
    return 'apple-watch';
  }

  if (normalizedSourceName.includes('iphone')) {
    return 'iphone';
  }

  return 'manual';
}

function mapWorkoutType(
  activityType: string | null | undefined,
  sourceName: string | null | undefined,
): WorkoutType {
  const normalizedActivityType = activityType?.toLowerCase() ?? '';
  const normalizedSourceName = sourceName?.toLowerCase() ?? '';

  if (normalizedSourceName.includes('peloton') || normalizedActivityType.includes('cycling')) {
    return 'peloton';
  }

  if (normalizedActivityType.includes('basketball')) {
    return 'basketball';
  }

  if (normalizedActivityType.includes('strength')) {
    return 'strength';
  }

  if (normalizedActivityType.includes('walk')) {
    return 'walk';
  }

  return 'other';
}

function buildWorkoutLabel(workoutType: WorkoutType) {
  const labels = {
    basketball: 'Basketball',
    other: 'Workout',
    peloton: 'Peloton ride',
    strength: 'Strength training',
    walk: 'Walk',
  } satisfies Record<WorkoutType, string>;

  return labels[workoutType];
}

function sourceRank(source: SourceSystem) {
  return SOURCE_PRIORITY.indexOf(source);
}

function startOfWeek(date: Date) {
  const weekStart = new Date(date);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));

  return weekStart;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);

  return result;
}

function endOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);

  return result;
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatWeekLabel(start: Date, end: Date) {
  const startLabel = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
  }).format(start);
  const endLabel = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: start.getMonth() === end.getMonth() ? undefined : 'short',
  }).format(end);

  return `Week of ${startLabel}-${endLabel}, ${end.getFullYear()}`;
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function roundTo(value: number, precision: number) {
  const multiplier = 10 ** precision;

  return Math.round(value * multiplier) / multiplier;
}

function waitForPaint() {
  return new Promise((resolve) => globalThis.setTimeout(resolve, 120));
}
