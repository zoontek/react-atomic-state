# react-global-state

```tsx
import { createGlobalState } from "react-global-state";

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

```tsx
import { createGlobalReducer } from "react-global-state";

type Action = { type: "increment" } | { type: "decrement" };

const reducer = (state: number, action: Action): number => {
  switch (action.type) {
    case "increment":
      return state + 1;
    case "decrement":
      return state - 1;
    default:
      return state;
  }
};

const [
  useCount,
  { getState, dispatch, addListener, removeAllListeners },
] = createGlobalReducer(reducer, 0);

const decrement = () => dispatch({ type: "decrement" });
const increment = () => dispatch({ type: "increment" });

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
