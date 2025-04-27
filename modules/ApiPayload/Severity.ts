import { z } from "zod";

export const Severity = {
  info: "info",
  error: "error",
  warning: "warning",
} as const;
export const SeveritySchema = z.enum(Object.values(Severity) as [string, ...string[]]);
export type SeverityType = (typeof Severity)[keyof typeof Severity];
