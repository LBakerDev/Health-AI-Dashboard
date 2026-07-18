export function registerServiceWorker() {
  const setServiceWorkerStatus = (status: string) => {
    document.documentElement.dataset.serviceWorker = status;
  };

  if (!import.meta.env.PROD) {
    setServiceWorkerStatus('dev');
    return;
  }

  if (!('serviceWorker' in navigator)) {
    setServiceWorkerStatus('unsupported');
    return;
  }

  window.addEventListener('load', () => {
    setServiceWorkerStatus('registering');

    navigator.serviceWorker
      .register('/service-worker.js')
      .then(() => navigator.serviceWorker.ready)
      .then(() => {
        setServiceWorkerStatus(navigator.serviceWorker.controller ? 'controlled' : 'ready');
      })
      .catch(() => {
        setServiceWorkerStatus('error');
      });
  });
}
