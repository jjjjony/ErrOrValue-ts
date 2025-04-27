import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";
import { Message, Severity, SeverityType } from "../../modules/ApiPayload";
import { ErrOr } from "./ErrOr";

// Extend the interface for new methods to be recognised everywhere by TS-intellisense
declare module "./ErrOr" {
  interface ErrOr<T> {
    errors(): string[];
    addMessage(message: string, severity?: SeverityType): ErrOr<T>;
    addMessages(messages: Message[]): ErrOr<T>;
    mergeWith(other: ErrOr<unknown>): ErrOr<T>;
    set(props: {
      message?: string;
      severity?: SeverityType;
      code?: StatusCodes;
      error?: unknown;
      value?: T;
    }): ErrOr<T>;
    ToApiResponse(): NextResponse<{ messages: Message[]; value?: T }>;
  }
}

// Implementation
ErrOr.prototype.errors = function (this: ErrOr<unknown>) {
  return this.messages
    .filter((m) => m.severity === Severity.error)
    .map((m) => m.message);
};

ErrOr.prototype.addMessage = function (
  this: ErrOr<unknown>,
  message: string,
  severity: SeverityType = Severity.info
) {
  this.messages.push({ message, severity });
  return this;
};

ErrOr.prototype.addMessages = function (
  this: ErrOr<unknown>,
  messages: Message[]
) {
  this.messages.push(...messages);
  return this;
};

ErrOr.prototype.mergeWith = function (
  this: ErrOr<unknown>,
  other: ErrOr<unknown>
) {
  this.code = other.code;
  this.messages.push(...other.messages);
  return this;
};

ErrOr.prototype.set = function (
  this: ErrOr<unknown>,
  {
    message,
    severity = Severity.info,
    code,
    error,
    value,
  }: {
    message?: string;
    severity?: SeverityType;
    code?: StatusCodes;
    error?: unknown;
    value?: unknown;
  }
) {
  if (message) this.addMessage(message, severity);
  if (code !== undefined) this.code = code;
  if (value !== undefined) this.value = value;

  if (error) {
    // Trace in Vercel logs
    console.error(`Caught error for request '${this.traceId}':`, error);

    // Share error with client during development only
    if (process.env.NODE_ENV === "development" && error) {
      const errorMessage =
        error instanceof Error ? error.message : error.toString();
      this.addMessage(errorMessage, Severity.error);
    }
  }

  return this;
};

ErrOr.prototype.ToApiResponse = function (this: ErrOr<unknown>) {
  const payload = {
    messages: this.messages,
    value: this.value,
  };

  const response = NextResponse.json(payload);

  response.headers.set("x-trace-id", this.traceId);

  return response;
};
