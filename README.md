# react-global-state

```tsx
import { createGlobalState, createGlobalReducer } from "react-global-state";

const [
  useCount,
  { getState, setState, addListener, removeAllListeners },
] = createGlobalState(0);

const decrement = () => setState((prevState) => prevState - 1);
const increment = () => setState((prevState) => prevState + 1);

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
