import { useEffect, useLayoutEffect, useReducer } from "react";

export type StateListener<S> = (state: S) => void;
export type GetValue<S> = () => S;
export type SetValue<S> = (value: S | ((prevState: S) => S)) => void;
export type AddListener<S> = (listener: StateListener<S>) => () => void;

export type StateApi<S> = {
  addListener: AddListener<S>;
  removeAllListeners: () => void;
  getValue: GetValue<S>;
  setValue: SetValue<S>;
  resetValue: () => void;
};

export function createState<S>(initialState: S): StateApi<S> {
  const listeners = new Set<StateListener<S>>();
  let state: S = initialState;

  return {
    addListener(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },

    removeAllListeners() {
      listeners.clear();
    },

    getValue() {
      return state;
    },

    setValue(value) {
      const nextState =
        typeof value === "function"
          ? (value as (prevState: S) => S)(state)
          : value;

      if (!Object.is(state, nextState)) {
        state = nextState;
        listeners.forEach((listener) => listener(state));
      }
    },

    resetValue() {
      if (!Object.is(state, initialState)) {
        state = initialState;
        listeners.forEach((listener) => listener(state));
      }
    },
  };
}

// For SSR / React Native: https://github.com/react-spring/zustand/pull/34
const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function createHook<S>(state: StateApi<S>): GetValue<S> {
  return function useGlobalState() {
    const [, forceUpdate] = useReducer(() => [], []);

    useIsoLayoutEffect(() => {
      const removeListener = state.addListener(forceUpdate);
      return removeListener;
    }, []);

    return state.getValue();
  };
}
