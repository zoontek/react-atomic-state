import { cleanup, fireEvent, render } from "@testing-library/react";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { atom, useAtom } from "../src";

afterEach(cleanup);

it("performs a basic example", async () => {
  const countAtom = atom(0);

  const increment = () => countAtom.set((prevCount) => prevCount + 1);

  const Counter = () => {
    const count = useAtom(countAtom);

    React.useEffect(() => {
      increment();
    }, []);

    return <div>count: {count}</div>;
  };

  const { findByText } = render(<Counter />);
  await findByText("count: 1");
});

it("only re-renders if value has changed", async () => {
  const countAtom = atom(0);

  const increment = () => countAtom.set((prevCount) => prevCount + 1);

  let counterRenderCount = 0;
  let controlRenderCount = 0;

  const Counter = () => {
    const count = useAtom(countAtom);
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

it("can be reset", async () => {
  const countAtom = atom(0);

  const increment = () => countAtom.set((prevCount) => prevCount + 1);

  const Counter = () => {
    const count = useAtom(countAtom);

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

it("can batch updates", async () => {
  const countAtom = atom(0);

  const increment = () => countAtom.set((prevCount) => prevCount + 1);

  const Counter = () => {
    const count = useAtom(countAtom);

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
