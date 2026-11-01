# Deploying to Liara

The backend runs on Liara (app `contevisualschool`). The built frontend (`dist/`)
is served by the backend. Deploys are done by hand from a local folder.

## The rules that matter

1. **`liara deploy` uploads your working folder.** It does not deploy from GitHub.
   Whatever is in the folder when you run it is what goes live.
2. **Files matched by `.gitignore` are not uploaded.** This once broke payments
   (a `.env` file stopped being uploaded). Check `.gitignore` before every deploy.
3. **Never add `dist/` to `.gitignore`.** It is the built frontend and is
   deployed from the folder. It is not tracked in git, so a fresh clone has no `dist/`.
4. **Production settings live in the Liara dashboard**, not in a `.env` file.
   Never create a `.env` with production values and never commit one.
5. **Uploaded files live on the Liara disk** mounted at `uploads` (see `liara.json`).
   `uploads/` is ignored by git and is not part of a deploy.

## Settings the app needs (Liara dashboard, environment)

Names only. Never write values in this repo.

| Name | Used for |
|---|---|
| `NODE_ENV` | `production` on the live app |
| `PORT` | server port (Liara config uses 3000) |
| `DATABASE` | MongoDB connection string |
| `JWT_SECRET` | signing login tokens |
| `JWT_EXPIRES_IN` | login token lifetime |
| `MESSAGEWAY_API_KEY` | SMS login codes |
| `ZARINPAL_ENV` | payment gateway mode |
| `ZARINPAL_MERCHANT_ID` | payment gateway merchant |
| `ZARINPAL_CALLBACK_URL` | where Zarinpal returns after payment |
| `FRONT_URL` | the site's public address |

`ADMIN_MOBILE` is read by the admin payment SMS but is not currently set.

## Deploy steps

1. `git checkout main` then `git pull origin main`
2. Confirm `dist\index.html` exists.
3. Confirm `git log --oneline -1` shows the commit you expect.
4. Run `liara deploy` and choose the `contevisualschool` app.

## After every deploy

1. Liara logs show `App running on port 3000` and
   `MongoDB connection established successfully`.
2. Logs do **not** show `Missing environment variables`.
3. `curl.exe https://conteschool.ir/api/health` returns `{"ok":true,...}`.
4. `curl.exe -i https://conteschool.ir/api/health/deep` returns `200`.
   A `503` means the database is down or a required setting is missing;
   the Liara logs name which one.
5. Log in and open a course page.

## If something breaks

- Payments fail: check `ZARINPAL_CALLBACK_URL`, `ZARINPAL_ENV` and the logs.
  The real Zarinpal error is logged.
- `/api/health/deep` returns 503: read the line `Deep health check failing`
  in the logs.
- Rolling back: check out the previous good commit and run `liara deploy` again.
