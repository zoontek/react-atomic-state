# ⚛️ react-atomic-state

[![bundlephobia](https://badgen.net/bundlephobia/minzip/react-atomic-state)](https://bundlephobia.com/result?p=react-atomic-state) [![npm version](https://badge.fury.io/js/react-atomic-state.svg)](https://www.npmjs.com/package/react-atomic-state) [![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

Dead simple React global state management based on [`use-sync-external-store`](https://github.com/facebook/react/tree/master/packages/use-sync-external-store).

## Installation

```bash
$ npm install --save react-atomic-state
# --- or ---
$ yarn add react-atomic-state
```

## ❓Motivation

I'm a **huge** fan of the _"state and props"_ couple, but sometimes I need to share a simple value to my entire application.<br />
I don't like the `Context` API and existing global state management libraries (overkill to me most of the times: state must be an object, you have to deal with selectors, etc.), so I decided to publish this small library to cover this specific need 🙌.

## Usage

```tsx
// states/count.ts
import { atom, useAtom, useAtomWithSelector } from "react-atomic-state";

const count = atom(0);

export const decrement = () => count.set((prevCount) => prevCount - 1);
export const increment = () => count.set((prevCount) => prevCount + 1);

const unsubscribe = count.subscribe((value) => {
  console.log(value); // log every update
});

// create a custom hook
export const useCount = () => useAtom(count);

// create a custom hook with selector
export const useStringCount = () =>
  useAtomWithSelector(count, (count) => count.toString());
```

```tsx
import { decrement, increment, useCount } from "./states/count.ts";

const Counter = () => {
  const count = useCount();

  return (
    <div>
      <span>count: {count}</span>

      <button onClick={decrement}>-1</button>
      <button onClick={increment}>+1</button>
    </div>
  );
};
```

## API

### atom()

```ts
type atom = <Value>(initialValue: Value) => {
  get: () => Value;
  set: (value: Value | ((prevValue: Value) => Value)) => void;
  subscribe: (callback: (value: Value) => void) => () => void;
  reset: () => void;
};
```

### useAtom()

```ts
type useAtom = <Value>(
  atom: Atom<Value>,
  isEqual?: (prevValue: Value, nextValue: Value) => boolean,
) => Value;
```

### useAtomWithSelector()

```ts
type useAtom = <Value, Selection>(
  atom: Atom<Value>,
  selector: (value: Value) => Selection,
  isEqual?: (prevSelection: Selection, nextSelection: Selection) => boolean,
) => Value;
```
