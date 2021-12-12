import { noop } from "svelte/internal";
import type { Subscriber, Unsubscriber, Updater, Writable } from "svelte/store";
import type { Setter, SubscribeStore } from "./store";

export interface BetterWritable<Value> extends Writable<Value> {
  get: () => Value;
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
    if (newValue !== value) {
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
