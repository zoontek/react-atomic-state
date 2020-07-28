import {
  Dispatch,
  Reducer,
  ReducerAction,
  ReducerState,
  SetStateAction,
  useEffect,
  useLayoutEffect,
  useReducer,
} from "react";

export type Listener<S> = (state: S) => void;

// For SSR / React Native: https://github.com/react-spring/zustand/pull/34
const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function createGlobalReducer<R extends Reducer<any, any>>(
  reducer: R,
  initialState: ReducerState<R>,
): [
  () => ReducerState<R>,
  {
    getState: () => ReducerState<R>;
    dispatch: Dispatch<ReducerAction<R>>;
    addListener: (listener: Listener<ReducerState<R>>) => void;
    removeAllListeners: () => void;
  },
] {
  let state: ReducerState<R> = initialState;
  const listeners = new Set<Listener<ReducerState<R>>>();

  function addListener(listener: Listener<ReducerState<R>>) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

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

export function createGlobalState<S>(
  initialState: S,
): [
  () => S,
  {
    getState: () => S;
    setState: Dispatch<SetStateAction<S>>;
    addListener: (listener: Listener<S>) => void;
    removeAllListeners: () => void;
  },
] {
  let state: S = initialState;
  const listeners = new Set<Listener<S>>();

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
