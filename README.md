# @zoontek/react-global-state

```tsx
// ./states/count.ts
import { createState, createHook } from "@zoontek/react-global-state";

const count = createState(0);

const {
  addListener,
  removeAllListeners,
  getValue,
  setValue,
  resetValue,
} = count;

export const useCount = createHook(count);

export const decrement = () => setValue((prevState) => prevState - 1);
export const increment = () => setValue((prevState) => prevState + 1);
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
