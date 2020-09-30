import { useEffect, useLayoutEffect, useReducer, useRef } from "react";

export type StateListener<S> = (value: S) => void;
export type StateSelector<S, D> = (value: S) => D;

export type StateApi<S> = {
  getValue: () => S;
  setValue: (value: S | ((prevState: S) => S)) => void;
  resetValue: () => void;
  addListener: (listener: StateListener<S>) => () => void;
};

export function createState<S>(initialState: S): StateApi<S> {
  const listeners = new Set<StateListener<S>>();
  let currentState: S = initialState;

  return {
    addListener(listener): ReturnType<StateApi<S>["addListener"]> {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },

    getValue(): ReturnType<StateApi<S>["getValue"]> {
      return currentState;
    },

    setValue(value): ReturnType<StateApi<S>["setValue"]> {
      const nextValue =
        typeof value === "function"
          ? (value as (prevState: S) => S)(currentState)
          : value;

      if (!Object.is(currentState, nextValue)) {
        currentState = nextValue;
        listeners.forEach((listener) => listener(currentState));
      }
    },

    resetValue(): ReturnType<StateApi<S>["resetValue"]> {
      if (!Object.is(currentState, initialState)) {
        currentState = initialState;
        listeners.forEach((listener) => listener(currentState));
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

export function createHook<S, D>(
  api: StateApi<S>,
  selector: StateSelector<S, D> = identity as any,
) {
  return function useGlobalState() {
    const [, forceUpdate] = useReducer(() => [], []);

    const state = api.getValue();

    const stateRef = useRef(state);
    const selectorRef = useRef(selector);
    const erroredRef = useRef(false);
    const currentDerivedStateRef = useRef<D>();

    if (currentDerivedStateRef.current === undefined) {
      currentDerivedStateRef.current = selector(state);
    }

    let newDerivedState: D | undefined;
    let hasNewDerivedState = false;

    // The selector need to be called during the render phase if it change.
    // We also want legitimate errors to be visible so we re-run them if
    // they errored in the subscriber.
    if (
      stateRef.current !== state ||
      selectorRef.current !== selector ||
      erroredRef.current
    ) {
      // Using local variables to avoid mutations in the render phase.
      newDerivedState = selector(state);
      hasNewDerivedState = !Object.is(
        currentDerivedStateRef.current as D,
        newDerivedState,
      );
    }

    // Syncing changes in useEffect.
    useIsoLayoutEffect(() => {
      if (hasNewDerivedState) {
        currentDerivedStateRef.current = newDerivedState as D;
      }

      stateRef.current = state;
      erroredRef.current = false;
    });

    const valueBeforeSubscriptionRef = useRef(state);

    useEffect(() => {
      const listener = () => {
        try {
          const nextValue = api.getValue();
          const nextDerivedValue = selectorRef.current(nextValue);

          if (
            !Object.is(currentDerivedStateRef.current as D, nextDerivedValue)
          ) {
            stateRef.current = nextValue;
            currentDerivedStateRef.current = nextDerivedValue;
            forceUpdate();
          }
        } catch (error) {
          erroredRef.current = true;
          forceUpdate();
        }
      };

      const unsubscribe = api.addListener(listener);

      if (api.getValue() !== valueBeforeSubscriptionRef.current) {
        listener(); // value has changed before subscription
      }

      return unsubscribe;
    }, []);

    return hasNewDerivedState
      ? (newDerivedState as D)
      : currentDerivedStateRef.current;
  };
}
