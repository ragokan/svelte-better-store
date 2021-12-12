import { noop } from "svelte/internal";
import type { Subscriber, Unsubscriber } from "svelte/store";
import type { BetterFiltered } from "./filtered";
import { betterFiltered } from "./filtered";
import type { BetterReadable } from "./readable";

export type SetStore<Store> = (newStore: Store) => void;
export type UpdateStore<Store> = (
  update: Partial<Store> | ((state: Store) => Partial<Store>)
) => void;
export type Setter<Store> = (set: SetStore<Store>) => Unsubscriber | void;
export type SubscribeStore<Store> = (sub: Subscriber<Store>) => Unsubscriber;
export type FilterStore<Store> = <Slice>(slice: (store: Store) => Slice) => BetterFiltered<Slice>;

export interface BetterStore<Store> extends BetterReadable<Store> {
  set: SetStore<Store>;
  update: UpdateStore<Store>;
  subscribe: SubscribeStore<Store>;
}

export const betterStore = <Store>(
  store: Store,
  setter: Setter<Store> = noop
): BetterStore<Store> => {
  let _stop: Unsubscriber | null;

  const _subscribers: Set<Subscriber<Store>> = new Set();

  const get = (): Store => store;

  const _notify = () => {
    if (_stop) {
      for (const subscriber of _subscribers) {
        try {
          subscriber(store);
        } catch (_) {}
      }
    }
  };

  const set = (newStore: Store): void => {
    if (newStore !== store) {
      store = newStore;
      _notify();
    }
  };

  const update: UpdateStore<Store> = (update) =>
    set(Object.assign({}, store, typeof update === "function" ? update(store) : update));

  const subscribe: SubscribeStore<Store> = (sub) => {
    _subscribers.add(sub);
    if (_subscribers.size === 1) {
      _stop = setter(set) || noop;
    }
    sub(store);
    return () => {
      _subscribers.delete(sub);
      if (_subscribers.size === 0) {
        _stop!();
        _stop = null;
      }
    };
  };

  const filter: FilterStore<Store> = <Slice>(
    slice: (store: Store) => Slice
  ): BetterFiltered<Slice> => betterFiltered(subscribe, slice);

  return { get, set, update, subscribe, filter };
};
