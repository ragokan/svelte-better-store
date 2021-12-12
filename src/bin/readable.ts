import type { Readable } from "svelte/store";
import { betterStore, FilterStore, Setter } from "./store";

export type GetStore<T> = () => T;

export interface BetterBase<T> extends Readable<T> {
  get: GetStore<T>;
}

export interface BetterReadable<T> extends BetterBase<T> {
  filter: FilterStore<T>;
}

export const betterReadable = <T>(value: T, setter: Setter<T>): BetterReadable<T> => {
  const _base = betterStore<T>(value, setter);

  return { get: _base.get, subscribe: _base.subscribe, filter: _base.filter };
};
