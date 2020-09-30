import { useEffect, useLayoutEffect, useReducer, useRef } from "react";

export type EqualityFn<T> = (value: T, newValue: unknown) => boolean;
export type Listener<T> = (value: T) => void;
export type Selector<T, S> = (value: T) => S;

export type Atom<T> = {
  get: () => T;
  set: (value: T | ((prevValue: T) => T)) => void;
  subscribe: (listener: Listener<T>) => () => void;
  reset: () => void;
};

export function atom<T>(initialValue: T): Atom<T> {
  const listeners = new Set<Listener<T>>();
  let currentValue: T = initialValue;

  return {
    get(): ReturnType<Atom<T>["get"]> {
      return currentValue;
    },

    set(value): ReturnType<Atom<T>["set"]> {
      const nextValue =
        typeof value === "function"
          ? (value as (prevValue: T) => T)(currentValue)
          : value;

      if (!Object.is(currentValue, nextValue)) {
        currentValue = nextValue;
        listeners.forEach((listener) => listener(currentValue));
      }
    },

    subscribe(listener): ReturnType<Atom<T>["subscribe"]> {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },

    reset(): ReturnType<Atom<T>["reset"]> {
      if (!Object.is(currentValue, initialValue)) {
        currentValue = initialValue;
        listeners.forEach((listener) => listener(currentValue));
      }
    },
  };
}

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

function identity<T>(value: T): T {
  return value;
}

export function hook<T, D>(
  atom: Atom<T>,
  selector: Selector<T, D> = identity as any,
) {
  return function useAtom() {
    const [, forceUpdate] = useReducer(() => [], []);

    const value = atom.get();

    const valueRef = useRef(value);
    const selectorRef = useRef(selector);
    const erroredRef = useRef(false);
    const currentDerivedValueRef = useRef<D>();

    if (currentDerivedValueRef.current === undefined) {
      currentDerivedValueRef.current = selector(value);
    }

    let newDerivedValue: D | undefined;
    let hasNewDerivedValue = false;

    // The selector need to be called during the render phase if it change.
    // We also want legitimate errors to be visible so we re-run them if
    // they errored in the subscriber.
    if (
      valueRef.current !== value ||
      selectorRef.current !== selector ||
      erroredRef.current
    ) {
      // Using local variables to avoid mutations in the render phase.
      newDerivedValue = selector(value);
      hasNewDerivedValue = !Object.is(
        currentDerivedValueRef.current as D,
        newDerivedValue,
      );
    }

    // Syncing changes in useEffect.
    useIsoLayoutEffect(() => {
      if (hasNewDerivedValue) {
        currentDerivedValueRef.current = newDerivedValue as D;
      }

      valueRef.current = value;
      erroredRef.current = false;
    });

    const valueBeforeSubscriptionRef = useRef(value);

    useEffect(() => {
      const listener = () => {
        try {
          const nextValue = atom.get();
          const nextDerivedValue = selectorRef.current(nextValue);

          if (
            !Object.is(currentDerivedValueRef.current as D, nextDerivedValue)
          ) {
            valueRef.current = nextValue;
            currentDerivedValueRef.current = nextDerivedValue;
            forceUpdate();
          }
        } catch (error) {
          erroredRef.current = true;
          forceUpdate();
        }
      };

      const unsubscribe = atom.subscribe(listener);

      if (atom.get() !== valueBeforeSubscriptionRef.current) {
        listener(); // value has changed before subscription
      }

      return unsubscribe;
    }, []);

    return hasNewDerivedValue
      ? (newDerivedValue as D)
      : currentDerivedValueRef.current;
  };
}
