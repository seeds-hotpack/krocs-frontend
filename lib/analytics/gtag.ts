declare global {
  interface Window {
    // gtag is injected by the GA script, so it's optional at runtime.
    gtag?: (...args: any[]) => void
  }
}

type Primitive = string | number | boolean

export type GAEventName =
  | "sign_up_complete"
  | "goal_created"
  | "plan_created"
  | "retrospective_submitted"

type EventPayloadMap = {
  sign_up_complete: {
    auth_method?: Primitive
    user_id?: Primitive
  }
  goal_created: {
    goal_id?: Primitive
    goal_priority?: Primitive
    goal_duration_days?: Primitive
  }
  plan_created: {
    plan_id?: Primitive
    plan_category?: Primitive
    all_day?: Primitive
    has_sub_tasks?: Primitive
  }
  retrospective_submitted: {
    goal_id?: Primitive
    retrospective_outcome?: Primitive
    factor_count?: Primitive
    has_context?: Primitive
  }
}

type EventParams<Name extends GAEventName> = EventPayloadMap[Name] & Record<string, Primitive | undefined>

const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || ""

const isBrowser = typeof window !== "undefined"

export const isGaReady = () => Boolean(GA_ID) && isBrowser && typeof window.gtag === "function"

export const trackPageView = (pagePath: string) => {
  if (!isGaReady()) {
    return
  }

  window.gtag!("config", GA_ID, {
    page_path: pagePath,
  })
}

export const trackEvent = <Name extends GAEventName>(
  name: Name,
  params: EventParams<Name> = {} as EventParams<Name>
) => {
  if (!isGaReady()) {
    return
  }

  const filteredEntries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
  )

  const payload = Object.fromEntries(filteredEntries)

  window.gtag!("event", name, {
    send_to: GA_ID,
    ...payload,
  })
}

export const getGaId = () => GA_ID

