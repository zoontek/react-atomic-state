import { Reducer, ReducerState, useReducer } from "react";
import { GetState, Listener, ReducerApi } from "./types";
import { useIsoLayoutEffect } from "./useIsoLayoutEffect";

export function createGlobalReducer<R extends Reducer<any, any>>(
  reducer: R,
  initialState: ReducerState<R>,
): [GetState<ReducerState<R>>, ReducerApi<R>] {
  const listeners = new Set<Listener<ReducerState<R>>>();
  let state: ReducerState<R> = initialState;

  const addListener: ReducerApi<R>["addListener"] = (
    listener: Listener<ReducerState<R>>,
  ) => {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  };

  return [
    function useGlobalReducer() {
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

      dispatch(action) {
        const nextState = reducer(state, action);

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
