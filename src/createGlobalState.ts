import { useReducer } from "react";
import { GetState, Listener, StateApi } from "./types";
import { useIsoLayoutEffect } from "./useIsoLayoutEffect";

export function createGlobalState<S>(
  initialState: S,
): [GetState<S>, StateApi<S>] {
  const listeners = new Set<Listener<S>>();
  let state: S = initialState;

  const addListener: StateApi<S>["addListener"] = (listener: Listener<S>) => {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  };

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
