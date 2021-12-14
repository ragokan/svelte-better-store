import type { Subscriber } from "svelte/store";
import type { BetterBase } from "./readable";
import type { SubscribeStore } from "./store";

export interface BetterCombined<CombinedStore> extends BetterBase<CombinedStore> {}

export type CombinedSubscribe = <State>(readable: BetterBase<State>) => State;

export type CombinedCallback<CombinedStore> = (subscribe: CombinedSubscribe) => CombinedStore;

export const betterCombined = <CombinedStore>(
  callback: CombinedCallback<CombinedStore>
): BetterCombined<CombinedStore> => {
  let _cancels: Array<Function> = [];

  let get = (): CombinedStore => callback((readable) => readable.get());

  const _subscribers: Set<Subscriber<CombinedStore>> = new Set();

  const subscribe: SubscribeStore<CombinedStore> = (sub) => {
    if (_cancels.length < 1) {
      sub(callback(_combinedSubscribe));
    } else {
      sub(get());
    }
    _subscribers.add(sub);
    return () => {
      _subscribers.delete(sub);
      if (_subscribers.size === 0) {
        _cancels.forEach((cancel) => cancel());
        _cancels = [];
      }
    };
  };

  const _notify = () => {
    const store = get();
    for (const subscriber of _subscribers) {
      try {
        subscriber(store);
      } catch (_) {}
    }
  };

  const _combinedSubscribe: CombinedSubscribe = (readable) => {
    _cancels.push(
      readable.subscribe(() => {
        if (_subscribers.size > 0) {
          _notify();
        }
      })
    );
    return readable.get();
  };

  return { subscribe, get };
};
