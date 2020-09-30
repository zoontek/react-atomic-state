# @zoontek/react-global-state

[![bundlephobia](https://badgen.net/bundlephobia/minzip/@zoontek/react-global-state)](https://bundlephobia.com/result?p=@zoontek/react-global-state) [![npm version](https://badge.fury.io/js/%40zoontek%2Freact-global-state.svg)](https://www.npmjs.com/package/@zoontek/react-global-state) [![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

Simple & minimalistic React global state management that works.

## Installation

```bash
$ npm install --save @zoontek/react-global-state
# --- or ---
$ yarn add @zoontek/react-global-state
```

## Motivation

TODO

## Usage

```tsx
// states/count.ts
import { atom, hook } from "@zoontek/react-global-state";

const count = atom(0);

export const useCount = hook(count);
export const useCountPlusOne = hook(count, (count) => count + 1); // you can derive values

export const decrement = () => count.set((prevCount) => prevCount - 1);
export const increment = () => count.set((prevCount) => prevCount + 1);
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
