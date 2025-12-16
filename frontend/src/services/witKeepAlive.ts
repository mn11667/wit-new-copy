const WIT_HEALTH_URL = 'https://witback.onrender.com/health';
const KEEPALIVE_INTERVAL_MS = 10 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 5000;

export const startWitKeepAlive = (): (() => void) => {
  const ping = async () => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(WIT_HEALTH_URL, { method: 'GET', signal: controller.signal });
      if (response.ok) {
        console.log(`WIT backend OK: ${response.status}`);
      } else {
        console.warn(`WIT backend warning: status ${response.status}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`WIT backend ping failed: ${message}`);
    } finally {
      clearTimeout(timeoutId);
    }
  };

  ping();
  const intervalId = window.setInterval(ping, KEEPALIVE_INTERVAL_MS);
  return () => window.clearInterval(intervalId);
};
