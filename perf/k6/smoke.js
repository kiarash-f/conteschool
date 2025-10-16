import http from 'k6/http';

export const options = { vus: 1, duration: '5s' };

export default function () {
  const base = __ENV.BASE_URL || 'https://conteschool.ir';
  const url = `${base}/api/health`;
  const res = http.get(url);
  console.log(
    `GET ${url} -> status=${res && res.status}, duration=${
      res && res.timings && res.timings.duration
    }`
  );
}
