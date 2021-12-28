import { noop, safe_not_equal } from "svelte/internal";
import type { Subscriber, Unsubscriber, Updater } from "svelte/store";
import type { BetterBase, Setter, SubscribeStore } from "./store";

export interface BetterWritable<Value> extends BetterBase<Value> {
  update(update: Updater<Value>): void;
}

export const betterWritable = <Value>(
  value: Value,
  setter: Setter<Value> = noop
): BetterWritable<Value> => {
  let _stop: Unsubscriber | null;

  const _subscribers: Set<Subscriber<Value>> = new Set();

  const get = (): Value => value;

  const _notify = () => {
    if (_stop) {
      for (const subscriber of _subscribers) {
        try {
          subscriber(value);
        } catch (_) {}
      }
    }
  };

  const set = (newValue: Value): void => {
    if (safe_not_equal(value, newValue)) {
      value = newValue;
      _notify();
    }
  };

  const update = (update: Updater<Value>) => set(update(value));

  const subscribe: SubscribeStore<Value> = (sub) => {
    _subscribers.add(sub);
    if (_subscribers.size === 1) {
      _stop = setter(set) || noop;
    }
    sub(value);
    return () => {
      _subscribers.delete(sub);
      if (_subscribers.size === 0) {
        _stop!();
        _stop = null;
      }
    };
  };

  return { get, set, update, subscribe };
};
