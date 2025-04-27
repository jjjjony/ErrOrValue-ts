import { z } from "zod";
import { SeveritySchema } from "./Severity";

export const MessageSchema = z.object({
  message: z.string(),
  severity: SeveritySchema,
});

export type Message = z.infer<typeof MessageSchema>;
