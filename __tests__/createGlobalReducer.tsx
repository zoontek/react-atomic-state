import { cleanup, fireEvent, render } from "@testing-library/react";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { createGlobalReducer } from "../src";

afterEach(cleanup);

type Action = { type: "increment" } | { type: "decrement" };

const reducer = (state: number, action: Action) => {
  switch (action.type) {
    case "increment":
      return state + 1;
    case "decrement":
      return state - 1;
    default:
      return state;
  }
};

it("creates a state hook and api object", () => {
  const output = createGlobalReducer(() => {}, null);

  expect(output).toMatchInlineSnapshot(`
    Array [
      [Function],
      Object {
        "addListener": [Function],
        "dispatch": [Function],
        "getState": [Function],
        "removeAllListeners": [Function],
      },
    ]
  `);
});

it("uses the state with no args", async () => {
  const [useCount, api] = createGlobalReducer(reducer, 0);
  const increment = () => api.dispatch({ type: "increment" });

  const Counter = () => {
    const count = useCount();

    React.useEffect(() => {
      increment();
    }, []);

    return <div>count: {count}</div>;
  };

  const { findByText } = render(<Counter />);
  await findByText("count: 1");
});

it("only re-renders if selected state has changed", async () => {
  const [useCount, api] = createGlobalReducer(reducer, 0);
  const increment = () => api.dispatch({ type: "increment" });

  let counterRenderCount = 0;
  let controlRenderCount = 0;

  const Counter = () => {
    const count = useCount();
    counterRenderCount++;
    return <div>count: {count}</div>;
  };

  const Control = () => {
    controlRenderCount++;
    return <button onClick={increment}>button</button>;
  };

  const { getByText, findByText } = render(
    <>
      <Counter />
      <Control />
    </>,
  );

  fireEvent.click(getByText("button"));
  await findByText("count: 1");

  expect(counterRenderCount).toBe(2);
  expect(controlRenderCount).toBe(1);
});

it("can batch updates", async () => {
  const [useCount, api] = createGlobalReducer(reducer, 0);
  const increment = () => api.dispatch({ type: "increment" });

  const Counter = () => {
    const count = useCount();

    React.useEffect(() => {
      ReactDOM.unstable_batchedUpdates(() => {
        increment();
        increment();
      });
    }, []);

    return <div>count: {count}</div>;
  };

  const { findByText } = render(<Counter />);
  await findByText("count: 2");
});
