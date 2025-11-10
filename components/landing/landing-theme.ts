import type { CSSProperties } from "react"

export const landingColors = {
  primary: "#ff8b6b",
  primaryHover: "#ff7a56",
  accent: "#bbdce5",
  accentDark: "#99c6d6",
  accentLight: "#eef5f7",
  ctaOverlay: "rgba(153, 198, 214, 0.25)",
  tableHeader: "#bbdce5",
  tableRow: "#eef5f7",
  tableRowAlt: "#e4f1f6",
} as const

export const landingGradients = {
  heroBackground: `linear-gradient(135deg, ${landingColors.accentLight}, ${landingColors.accentDark})`,
  ctaBackground: `linear-gradient(135deg, ${landingColors.accentDark}, ${landingColors.accent})`,
  aboutBackground: `linear-gradient(135deg, ${landingColors.accentLight}, var(--background))`,
  aboutStroke: `linear-gradient(90deg, ${landingColors.accent}, ${landingColors.accentDark})`,
} as const

export const landingColorVars: CSSProperties = {
  "--landing-primary": landingColors.primary,
  "--landing-primary-hover": landingColors.primaryHover,
  "--landing-accent": landingColors.accent,
  "--landing-accent-dark": landingColors.accentDark,
  "--landing-accent-light": landingColors.accentLight,
  "--landing-cta-overlay": landingColors.ctaOverlay,
  "--landing-table-header": landingColors.tableHeader,
  "--landing-table-row": landingColors.tableRow,
  "--landing-table-row-alt": landingColors.tableRowAlt,
}
