import type { Subscriber, Unsubscriber } from "svelte/store";
import type { BetterFiltered } from "./filtered";
import { betterFiltered } from "./filtered";
import type { BetterReadable } from "./readable";

// From Svelte but I didn't want to import it, because of Svelte REPL error: 'default' is not exported by svelte...
const noop = () => {};

export type SetStore<Store> = (newStore: Store) => void;
export type FullUpdate<Store> = Partial<Store> | ((state: Store) => Partial<Store>);
export interface UpdateStore<Store> {
  <Setter extends keyof Store>(key: Setter, update: (value: Store[Setter]) => Store[Setter]): void;
  (update: FullUpdate<Store>): void;
}
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

  const update: UpdateStore<Store> = <Setter extends keyof Store = any>(...args: any[]) => {
    if (args.length == 2) {
      const param1 = args[0] as Setter;
      const param2 = args[1] as (value: Store[Setter]) => Store[Setter];
      return set(Object.assign({}, store, { [param1]: param2(store[param1]) }));
    }
    const param1 = args[0] as FullUpdate<Store>;
    set(Object.assign({}, store, typeof param1 === "function" ? param1(store) : param1));
  };

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
  ): BetterFiltered<Slice> => betterFiltered(subscribe, get, slice);

  return { get, set, update, subscribe, filter };
};
