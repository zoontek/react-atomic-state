import { useEffect, useLayoutEffect, useReducer, useRef } from "react";

export type StateListener<S> = (state: S) => void;
export type StateSelector<S, D> = (state: S) => D;

export type StateApi<S> = {
  addListener: (listener: StateListener<S>) => () => void;
  getState: () => S;
  setState: (value: S | ((prevState: S) => S)) => void;
  resetState: () => void;
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

    getState(): ReturnType<StateApi<S>["getState"]> {
      return currentState;
    },

    setState(value): ReturnType<StateApi<S>["setState"]> {
      const nextState =
        typeof value === "function"
          ? (value as (prevState: S) => S)(currentState)
          : value;

      if (!Object.is(currentState, nextState)) {
        currentState = nextState;
        listeners.forEach((listener) => listener(currentState));
      }
    },

    resetState(): ReturnType<StateApi<S>["resetState"]> {
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

    const state = api.getState();

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

    const stateBeforeSubscriptionRef = useRef(state);

    useEffect(() => {
      const listener = () => {
        try {
          const nextState = api.getState();
          const nextDerivedState = selectorRef.current(nextState);

          if (
            !Object.is(currentDerivedStateRef.current as D, nextDerivedState)
          ) {
            stateRef.current = nextState;
            currentDerivedStateRef.current = nextDerivedState;
            forceUpdate();
          }
        } catch (error) {
          erroredRef.current = true;
          forceUpdate();
        }
      };

      const unsubscribe = api.addListener(listener);

      if (api.getState() !== stateBeforeSubscriptionRef.current) {
        listener(); // state has changed before subscription
      }

      return unsubscribe;
    }, []);

    return hasNewDerivedState
      ? (newDerivedState as D)
      : currentDerivedStateRef.current;
  };
}
