import { cleanup, fireEvent, render } from "@testing-library/react";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { atom, useAtom } from "../src";

afterEach(cleanup);

it("performs a basic example", async () => {
  const countAtom = atom(0);

  const Counter = () => {
    const count = useAtom(countAtom);

    React.useEffect(() => {
      countAtom.set((prevCount) => prevCount + 1);
    }, []);

    return <div>count: {count}</div>;
  };

  const { findByText } = render(<Counter />);
  await findByText("count: 1");
});

it("only re-renders if value has changed", async () => {
  const countAtom = atom(0);
  let renderCount = 0;

  const Counter = () => {
    const count = useAtom(countAtom);
    renderCount++;

    return (
      <>
        <div>count: {count}</div>

        <button
          onClick={() => {
            countAtom.set((prevCount) => prevCount + 1);
          }}
        >
          button
        </button>
      </>
    );
  };

  const { getByText, findByText } = render(<Counter />);

  fireEvent.click(getByText("button"));
  await findByText("count: 1");

  expect(renderCount).toBe(2);
});

it("can be reset", async () => {
  const countAtom = atom(0);

  const Counter = () => {
    const count = useAtom(countAtom);

    return (
      <>
        <div>count: {count}</div>

        <button
          onClick={() => {
            countAtom.set((prevCount) => prevCount + 1);
          }}
        >
          increment
        </button>

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

  const Counter = () => {
    const count = useAtom(countAtom);

    React.useEffect(() => {
      ReactDOM.unstable_batchedUpdates(() => {
        countAtom.set((prevCount) => prevCount + 1);
        countAtom.set((prevCount) => prevCount + 1);
      });
    }, []);

    return <div>count: {count}</div>;
  };

  const { findByText } = render(<Counter />);
  await findByText("count: 2");
});
