export const produce =
  <T>(callback: (store: T) => void) =>
  (store: T) => {
    callback(store);
    return store;
  };
