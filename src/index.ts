import { useMemo } from "react";
import { useSubscription } from "use-subscription";

export type Atom<Value> = {
  get: () => Value;
  set: (value: Value | ((prevValue: Value) => Value)) => void;
  subscribe: (callback: (value: Value) => void) => () => void;
  reset: () => void;
};

export function atom<Value>(initialValue: Value): Atom<Value> {
  const callbacks = new Set<(value: Value) => void>();
  let currentValue: Value = initialValue;

  return {
    get() {
      return currentValue;
    },

    set(value) {
      currentValue =
        typeof value === "function"
          ? (value as (prevValue: Value) => Value)(currentValue)
          : value;

      callbacks.forEach((callback) => callback(currentValue));
    },

    subscribe(callback) {
      callbacks.add(callback);

      return () => {
        callbacks.delete(callback);
      };
    },

    reset() {
      currentValue = initialValue;
      callbacks.forEach((callback) => callback(currentValue));
    },
  };
}

export function useAtom<Value>(atom: Atom<Value>): Value {
  const subscription = useMemo(
    () => ({
      getCurrentValue() {
        return atom.get();
      },
      subscribe(callback: (value: Value) => void) {
        const unsubscribe = atom.subscribe(callback);
        return unsubscribe;
      },
    }),
    [atom],
  );

  return useSubscription(subscription);
}
