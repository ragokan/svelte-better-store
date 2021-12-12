import type { Subscriber } from "svelte/store";
import type { BetterBase, BetterReadable } from "./readable";
import type { SubscribeStore } from "./store";

export interface BetterCombined<CombinedStore> extends BetterBase<CombinedStore> {}

export type CombinedSubscribe = <State>(readable: BetterReadable<State>) => State;

export type CombinedCallback<CombinedStore> = (subscribe: CombinedSubscribe) => CombinedStore;

export const betterCombinedStore = <CombinedStore>(
  callback: CombinedCallback<CombinedStore>
): BetterCombined<CombinedStore> => {
  let _isActive = false;
  let _cancels: Array<Function> = [];

  let get = (): CombinedStore => callback(_combinedSubscribe);

  const _subscribers: Set<Subscriber<CombinedStore>> = new Set();

  const subscribe: SubscribeStore<CombinedStore> = (sub) => {
    _subscribers.add(sub);
    sub(get());
    if (!_isActive) {
      _isActive = true;
    }
    return () => {
      _subscribers.delete(sub);
      if (_subscribers.size === 0) {
        _isActive = false;
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
    if (!_isActive) {
      _cancels.push(
        readable.subscribe(() => {
          if (_isActive) {
            _notify();
          }
        })
      );
    }
    return readable.get();
  };

  return { subscribe, get };
};
