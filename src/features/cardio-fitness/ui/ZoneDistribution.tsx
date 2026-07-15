import type { HeartRateZone } from '@entities/health-metric';
import { GlassSurface } from '@shared/ui/glass-surface';

interface ZoneDistributionProps {
  zones: HeartRateZone[];
}

export function ZoneDistribution({ zones }: ZoneDistributionProps) {
  const maxMinutes = Math.max(...zones.map((zone) => zone.minutes));
  const targetMinutes = zones
    .filter((zone) => zone.target)
    .reduce((total, zone) => total + zone.minutes, 0);

  return (
    <GlassSurface className="zone-panel" tone="solid">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Heart-rate zones</p>
          <h2>{targetMinutes} min in Zone 2/3</h2>
        </div>
        <p>Target work is concentrated in aerobic and tempo zones.</p>
      </div>
      <div className="zone-list">
        {zones.map((zone) => (
          <div className="zone-row" data-target={zone.target || undefined} key={zone.zone}>
            <span>{zone.label}</span>
            <div className="zone-bar" aria-hidden="true">
              <i style={{ width: `${(zone.minutes / maxMinutes) * 100}%` }} />
            </div>
            <strong>{zone.minutes} min</strong>
          </div>
        ))}
      </div>
    </GlassSurface>
  );
}
