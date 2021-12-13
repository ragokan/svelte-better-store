import type { Subscriber } from "svelte/store";
import type { BetterBase } from "./readable";
import type { SubscribeStore } from "./store";

export interface BetterCombined<CombinedStore> extends BetterBase<CombinedStore> {}

export type CombinedSubscribe = <State>(readable: BetterBase<State>) => State;

export type CombinedCallback<CombinedStore> = (subscribe: CombinedSubscribe) => CombinedStore;

export const betterCombined = <CombinedStore>(
  callback: CombinedCallback<CombinedStore>
): BetterCombined<CombinedStore> => {
  let _hasSubscribers = false;
  let _cancels: Array<Function> = [];

  let get = (): CombinedStore => callback(_combinedSubscribe);

  const _subscribers: Set<Subscriber<CombinedStore>> = new Set();

  const subscribe: SubscribeStore<CombinedStore> = (sub) => {
    _subscribers.add(sub);
    sub(get());
    if (!_hasSubscribers) {
      _hasSubscribers = true;
    }
    return () => {
      _subscribers.delete(sub);
      if (_subscribers.size === 0) {
        _hasSubscribers = false;
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
    if (!_hasSubscribers) {
      _cancels.push(
        readable.subscribe(() => {
          if (_hasSubscribers) {
            _notify();
          }
        })
      );
    }
    return readable.get();
  };

  return { subscribe, get };
};
