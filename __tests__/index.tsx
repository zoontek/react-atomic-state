import { cleanup, fireEvent, render } from "@testing-library/react";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { createState, createHook } from "../src";

afterEach(cleanup);

it("creates a state hook and api object", () => {
  const output = createState(null);

  expect(output).toMatchInlineSnapshot(`
    Object {
      "addListener": [Function],
      "getState": [Function],
      "resetState": [Function],
      "setState": [Function],
    }
  `);
});

it("uses the state with no args", async () => {
  const countApi = createState(0);
  const useCount = createHook(countApi);

  const increment = () => countApi.setState((prevCount) => prevCount + 1);

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
  const countApi = createState(0);
  const useCount = createHook(countApi);

  const increment = () => countApi.setState((prevCount) => prevCount + 1);

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
  const countApi = createState(0);
  const useCount = createHook(countApi);

  const increment = () => countApi.setState((prevCount) => prevCount + 1);

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

it("can be reset", async () => {
  const countApi = createState(0);
  const useCount = createHook(countApi);

  const increment = () => countApi.setState((prevCount) => prevCount + 1);

  const Counter = () => {
    const count = useCount();

    return (
      <>
        <div>count: {count}</div>
        <button onClick={increment}>increment</button>
        <button onClick={countApi.resetState}>reset</button>
      </>
    );
  };

  const { getByText, findByText } = render(<Counter />);

  fireEvent.click(getByText("increment"));
  await findByText("count: 1");

  fireEvent.click(getByText("reset"));
  await findByText("count: 0");
});

it("can be derived", async () => {
  const countObjectApi = createState({ count: 0 });

  const useCount = createHook(
    countObjectApi,
    (countObject) => countObject.count,
  );

  const useCountPlusOne = createHook(
    countObjectApi,
    (countObject) => countObject.count + 1,
  );

  const increment = () =>
    countObjectApi.setState((prevCountObject) => ({
      ...prevCountObject,
      count: prevCountObject.count + 1,
    }));

  const Counter = () => {
    const count = useCount();
    const countPlusOne = useCountPlusOne();

    React.useEffect(() => {
      increment();
    }, []);

    return (
      <>
        <div>count: {count}</div>
        <div>countPlusOne: {countPlusOne}</div>
      </>
    );
  };

  const { findByText } = render(<Counter />);
  await findByText("count: 1");
  await findByText("countPlusOne: 2");
});
