import { MonoTypeOperatorFunction, Observable, timer } from 'rxjs';
import { retry, switchMap } from 'rxjs/operators';

export interface PollOptions {
  /** Interval between polls (ms). Default: 1 hour. */
  readonly period?: number;
  /** Poll immediately on subscribe, or wait one full period first. Default: true. */
  readonly immediate?: boolean;
  /** Delay before retrying after the source errors (ms). Default: 30s. */
  readonly retryDelay?: number;
}

const ONE_HOUR = 60 * 60 * 1000;

/**
 * Custom pipeable operator COMPOSED from existing operators
 * (`timer` + `switchMap` + `retry`) to re-poll `source$` on an interval.
 *
 * How it works:
 *  - `timer(startAt, period)` emits 0,1,2,... once per period.
 *  - `switchMap` re-subscribes to the (cold) `source$` on every tick and
 *    CANCELS the previous unfinished run → requests never pile up.
 *  - `retry({ delay })` keeps a single failed fetch from killing the stream.
 *
 * MEMORY-LEAK SAFETY:
 *  - `switchMap` tears down the old inner subscription on each new tick,
 *    so at most one request is alive at any time.
 *  - The stream created by `timer` is INFINITE (never completes), so
 *    LIFETIME MANAGEMENT belongs to the subscriber. Always terminate it via:
 *      • `toSignal(...)` (auto-unsubscribes with the injection context), or
 *      • `takeUntilDestroyed()` in a component/service, or
 *      • the `async` pipe in a template.
 *    This operator deliberately keeps NO module-level subscription, so
 *    nothing can outlive its consumer.
 */
export function poll<T>(options: PollOptions = {}): MonoTypeOperatorFunction<T> {
  const { period = ONE_HOUR, immediate = true, retryDelay = 30_000 } = options;

  return (source$: Observable<T>): Observable<T> =>
    timer(immediate ? 0 : period, period).pipe(
      switchMap(() => source$.pipe(retry({ delay: retryDelay }))),
    );
}
