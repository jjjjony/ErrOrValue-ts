import "server-only";

import { StatusCodes } from "http-status-codes";
import { Message, Severity } from "../../modules/ApiPayload";

export class ErrOr<T = void> {
  public messages: Message[] = [];
  public code: StatusCodes = StatusCodes.OK;
  public traceId: string; // to correlation user's journey

  // For TS-intellisense, mark value as never if no generic was supplied
  public value!: T extends void ? never : T | undefined;

  constructor(traceId?: string) {
    this.traceId = traceId ?? "none";
  }

  /**
   * Type guard to check if the result is OK
   * Unlike the dotnet ErrOrValue, types are lost at runtime, so we can't check if T was given or not
   * Solution? opt-in to check T is defined
   *
   * Also tell TS-intellisense that value is defined if using overload 3
   */
  public isOk(): boolean; // Overload 1: No arguments
  public isOk(withValue: false): boolean; // Overload 2: withValue = false
  public isOk(withValue: true): this is ErrOr<T> & { value: T }; // Overload 3: withValue = true
  public isOk(withValue: boolean = false): boolean {
    const hasErrors = this.messages.some((m) => m.severity === Severity.error);
    const isValidStatusCode = this.code >= 200 && this.code <= 299;
    const hasValue = withValue
      ? this.value !== undefined && this.value !== null
      : true;
    return !hasErrors && isValidStatusCode && hasValue;
  }
}
