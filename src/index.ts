import { useEffect, useLayoutEffect, useReducer } from "react";
import { GetValue, StateApi } from "./vanilla";

export * from "./vanilla";

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
