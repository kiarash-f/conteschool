import http from 'k6/http';
import { sleep } from 'k6';

// Env can override; defaults are just fallbacks
const BASE_URL = __ENV.BASE_URL || 'https://conteschool.ir';
// Use only endpoints that returned 200 in your probe:
const ENDPOINTS = ['/api/health', '/api/courses', '/api/news'];

export const options = {
  vus: Number(__ENV.VUS || 100),
  duration: __ENV.DURATION || '30s',
  thresholds: {
    http_req_failed: ['rate<0.02'], // < 2% errors
    http_req_duration: ['p(95)<800'], // p95 < 800 ms
  },
};

export default function () {
  for (const p of ENDPOINTS) {
    const url = `${BASE_URL}${p}`;
    // No custom Trend/Rate; just make the request
    // k6 will record http_req_duration/http_req_failed automatically
    try {
      const res = http.get(url, { timeout: '30s', tags: { endpoint: p } });
      // optional: tiny log to see statuses during run
      console.log(`GET ${url} -> ${res.status}`);
    } catch (e) {
      // network/TLS/DNS faults won’t crash the script
      console.log(`GET ${url} -> ERROR: ${e && e.message}`);
    }
    sleep(1);
  }
}
