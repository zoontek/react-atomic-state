import { cleanup, fireEvent, render } from "@testing-library/react";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { atom, hook } from "../src";

afterEach(cleanup);

it("creates a state hook and api object", () => {
  const output = atom(null);

  expect(output).toMatchInlineSnapshot(`
    Object {
      "get": [Function],
      "reset": [Function],
      "set": [Function],
      "subscribe": [Function],
    }
  `);
});

it("uses the state with no args", async () => {
  const countAtom = atom(0);
  const useCount = hook(countAtom);

  const increment = () => countAtom.set((prevCount) => prevCount + 1);

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
  const countAtom = atom(0);
  const useCount = hook(countAtom);

  const increment = () => countAtom.set((prevCount) => prevCount + 1);

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
  const countAtom = atom(0);
  const useCount = hook(countAtom);

  const increment = () => countAtom.set((prevCount) => prevCount + 1);

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
  const countAtom = atom(0);
  const useCount = hook(countAtom);

  const increment = () => countAtom.set((prevCount) => prevCount + 1);

  const Counter = () => {
    const count = useCount();

    return (
      <>
        <div>count: {count}</div>
        <button onClick={increment}>increment</button>
        <button onClick={countAtom.reset}>reset</button>
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
  const countObjectAtom = atom({ count: 0 });

  const useCount = hook(countObjectAtom, (countObject) => countObject.count);
  const useCountPlusOne = hook(
    countObjectAtom,
    (countObject) => countObject.count + 1,
  );

  const increment = () =>
    countObjectAtom.set((prevCountObject) => ({
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
