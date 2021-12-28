import { noop } from "svelte/internal";
import type { Subscriber, Unsubscriber, Writable } from "svelte/store";

export interface $Base<T> extends Writable<T> {
  get: GetStore<T>;
  set: SetStore<T>;
}

export type GetStore<T> = () => T;
export type SetStore<Store> = (newStore: Store) => void;
export type FullUpdate<Store> = Partial<Store> | ((state: Store) => Partial<Store>);
export type Setter<Store> = (set: SetStore<Store>) => Unsubscriber | void;
export interface UpdateStore<Store> {
  <Setter extends keyof Store>(key: Setter, update: (value: Store[Setter]) => Store[Setter]): void;
  (update: FullUpdate<Store>): void;
}
export type SubscribeStore<Store> = (sub: Subscriber<Store>) => Unsubscriber;

export interface $Store<Store> extends $Base<Store> {
  update: UpdateStore<Store>;
  subscribe: SubscribeStore<Store>;
}

export const $store = <Store>(store: Store, setter: Setter<Store> = noop): $Store<Store> => {
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
    // No need to call safe_not_equal like writable, since they will always be not equal (both of parameters are object).
    store = newStore;
    _notify();
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

  return { get, set, update, subscribe };
};
