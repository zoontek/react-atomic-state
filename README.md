# ⚛️ react-atomic-state

Dead simple React global state management based on [`use-sync-external-store`](https://github.com/facebook/react/tree/master/packages/use-sync-external-store).

[![mit licence](https://img.shields.io/dub/l/vibe-d.svg?style=for-the-badge)](https://github.com/zoontek/react-atomic-state/blob/main/LICENSE)
[![npm version](https://img.shields.io/npm/v/valienv?style=for-the-badge)](https://www.npmjs.org/package/react-atomic-state)
[![bundlephobia](https://img.shields.io/bundlephobia/minzip/react-atomic-state?label=size&style=for-the-badge)](https://bundlephobia.com/result?p=valienv)

## Installation

```bash
$ npm install --save react-atomic-state
# --- or ---
$ yarn add react-atomic-state
```

## ❓Motivation

I'm a **huge** fan of the _"state and props"_ couple, but sometimes I need to share a simple value to my entire application.<br />
I don't like the `Context` API and existing global state management libraries (overkill to me most of the times. So I decided to publish this small library to cover this specific need 🙌.

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
