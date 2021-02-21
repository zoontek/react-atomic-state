import { useMemo } from "react";
import { useSubscription } from "use-subscription";

export type Atom<Value> = {
  get: () => Value;
  reset: () => void;
  set: (value: Value | ((prevValue: Value) => Value)) => void;
  subscribe: (callback: (value: Value) => void) => () => void;
};

export function atom<Value>(initialValue: Value): Atom<Value> {
  const callbacks = new Set<(value: Value) => void>();
  let currentValue: Value = initialValue;

  return {
    get(): ReturnType<Atom<Value>["get"]> {
      return currentValue;
    },

    reset(): ReturnType<Atom<Value>["reset"]> {
      if (!Object.is(currentValue, initialValue)) {
        currentValue = initialValue;
        callbacks.forEach((callback) => callback(currentValue));
      }
    },

    set(value): ReturnType<Atom<Value>["set"]> {
      const nextValue =
        typeof value === "function"
          ? (value as (prevValue: Value) => Value)(currentValue)
          : value;

      if (!Object.is(currentValue, nextValue)) {
        currentValue = nextValue;
        callbacks.forEach((callback) => callback(currentValue));
      }
    },

    subscribe(callback): ReturnType<Atom<Value>["subscribe"]> {
      callbacks.add(callback);

      return () => {
        callbacks.delete(callback);
      };
    },
  };
}

export function useAtom<Value>(atom: Atom<Value>) {
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
