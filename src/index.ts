import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

export type Atom<Value> = {
  get: () => Value;
  set: (value: Value | ((prevValue: Value) => Value)) => void;
  subscribe: (callback: (value: Value) => void) => () => void;
  reset: () => void;
};

// For server-side rendering: https://github.com/pmndrs/zustand/pull/34
// Deno support: https://github.com/pmndrs/zustand/issues/347
const isSSR =
  typeof window === "undefined" ||
  !window.navigator ||
  /ServerSideRendering|^Deno\//.test(window.navigator.userAgent);

const useIsoLayoutEffect = isSSR ? useEffect : useLayoutEffect;

export function atom<Value>(initialValue: Value): Atom<Value> {
  const callbacks = new Set<(value: Value) => void>();
  let currentValue: Value = initialValue;

  return {
    get() {
      return currentValue;
    },

    set(value) {
      currentValue =
        typeof value === "function"
          ? (value as (prevValue: Value) => Value)(currentValue)
          : value;

      callbacks.forEach((callback) => callback(currentValue));
    },

    subscribe(callback) {
      callbacks.add(callback);

      return () => {
        callbacks.delete(callback);
      };
    },

    reset() {
      currentValue = initialValue;
      callbacks.forEach((callback) => callback(currentValue));
    },
  };
}

export function useAtom<Value>(atom: Atom<Value>): Value {
  return useSyncExternalStore(atom.subscribe, atom.get, atom.get);
}

export function useAtomWithSelector<Value, Selection>(
  atom: Atom<Value>,
  selector: (value: Value) => Selection,
): Selection {
  const [selection, setSelection] = useState(() => selector(atom.get()));
  const selectorRef = useRef(selector);

  useIsoLayoutEffect(() => {
    selectorRef.current = selector;
  });

  useIsoLayoutEffect(
    () => atom.subscribe((value) => setSelection(selectorRef.current(value))),
    [atom],
  );

  return selection;
}
