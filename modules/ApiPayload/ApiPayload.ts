import { z } from "zod";
import { MessageSchema } from "./Message";

export function getApiPayloadSchema<T extends z.ZodTypeAny>(valueSchema: T) {
  return z.object({
    value: valueSchema.optional(),
    messages: z.array(MessageSchema),
  });
}

export type ApiPayload<T = void> = {
  value?: T;
  messages: z.infer<typeof MessageSchema>[];
};
