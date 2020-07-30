import { Dispatch, SetStateAction, useReducer } from "react";
import { Listener } from "./types";
import { useIsoLayoutEffect } from "./useIsoLayoutEffect";

export function createGlobalState<S>(
  initialState: S,
): [
  () => S,
  {
    addListener: (listener: Listener<S>) => void;
    removeAllListeners: () => void;
    getState: () => S;
    setState: Dispatch<SetStateAction<S>>;
  },
] {
  const listeners = new Set<Listener<S>>();
  let state: S = initialState;

  function addListener(listener: Listener<S>) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  return [
    function useGlobalState() {
      const [, forceUpdate] = useReducer(() => [], []);

      useIsoLayoutEffect(() => {
        const removeListener = addListener(forceUpdate);
        return removeListener;
      }, []);

      return state;
    },
    {
      getState() {
        return state;
      },

      setState(value) {
        const nextState =
          typeof value === "function"
            ? (value as (prevState: S) => S)(state)
            : value;

        if (!Object.is(state, nextState)) {
          state = nextState;
          listeners.forEach((listener) => listener(state));
        }
      },

      addListener,
      removeAllListeners: listeners.clear,
    },
  ];
}
