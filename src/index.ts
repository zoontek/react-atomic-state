import { useCallback, useRef, useSyncExternalStore } from "react";

const UNSET = Symbol.for("unset");

export type Atom<Value> = {
  get: () => Value;
  set: (value: Value | ((prevValue: Value) => Value)) => void;
  subscribe: (callback: (value: Value) => void) => () => void;
  reset: () => void;
};

function useSyncExternalStoreWithSelector<Snapshot, Selection>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => Snapshot,
  selector: (snapshot: Snapshot) => Selection,
  isEqual: (prevSelection: Selection, nextSelection: Selection) => boolean,
): Selection {
  const ref = useRef<Selection | typeof UNSET>(UNSET);

  const getSelection = useCallback((): Selection => {
    const selection = selector(getSnapshot());

    if (ref.current === UNSET || !isEqual(ref.current, selection)) {
      ref.current = selection;
    }

    return ref.current;
  }, [getSnapshot, selector, isEqual]);

  return useSyncExternalStore(subscribe, getSelection, getSelection);
}

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

function identity<Value>(value: Value): Value {
  return value;
}

export function useAtom<Value>(
  atom: Atom<Value>,
  isEqual: (prevValue: Value, nextValue: Value) => boolean = Object.is,
): Value {
  return useSyncExternalStoreWithSelector(
    atom.subscribe,
    atom.get,
    identity,
    isEqual,
  );
}

export function useAtomWithSelector<Value, Selection>(
  atom: Atom<Value>,
  selector: (value: Value) => Selection,
  isEqual: (
    prevSelection: Selection,
    nextSelection: Selection,
  ) => boolean = Object.is,
): Selection {
  return useSyncExternalStoreWithSelector(
    atom.subscribe,
    atom.get,
    selector,
    isEqual,
  );
}
