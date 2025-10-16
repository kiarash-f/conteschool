import http from 'k6/http';

export const options = { vus: 1, duration: '5s' };

// Put only public, read-only GET endpoints here:
const BASE_URL = __ENV.BASE_URL || 'https://conteschool.ir';
const ENDPOINTS = ['/api/health', '/api/courses', '/api/news'];

export default function () {
  for (const p of ENDPOINTS) {
    const url = `${BASE_URL}${p}`;
    try {
      const res = http.get(url, { timeout: '15s' });
      console.log(`GET ${url} -> ${res.status}`);
    } catch (e) {
      console.log(`GET ${url} -> ERROR ${e && e.message}`);
    }
  }
}
