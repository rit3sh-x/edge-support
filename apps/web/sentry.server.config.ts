import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN_KEY,
  tracesSampleRate: 1,
  enableLogs: true,
  debug: false,
});