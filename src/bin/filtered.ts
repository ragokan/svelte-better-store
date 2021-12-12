import type { BetterReadable } from "./readable";
import type { SubscribeStore } from "./store";

export interface BetterFiltered<Slice> extends BetterReadable<Slice> {}

export const betterFiltered = <ParentState, Slice>(
  parentSubscribe: SubscribeStore<ParentState>,
  slice: (store: ParentState) => Slice
): BetterFiltered<Slice> => {
  let currentSlice: Slice | null = null;

  return {
    get: () => currentSlice,
    subscribe: (subscriber) =>
      parentSubscribe((store) => {
        let newSlice = slice(store);
        if (currentSlice !== newSlice || currentSlice === null) {
          currentSlice = newSlice;
          subscriber(newSlice);
        }
      }),
  } as BetterFiltered<Slice>;
};
