import * as Sentry from "@sentry/nextjs";

const isProd = process.env.NODE_ENV === "production";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: isProd ? "production" : "development",

  // 성능 추적 샘플 비율
  // - 개발: 100% (디버깅 편하게)
  // - 프로덕션: 20% 정도만
  tracesSampleRate: isProd ? 0.2 : 1.0,

  sendDefaultPii: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;