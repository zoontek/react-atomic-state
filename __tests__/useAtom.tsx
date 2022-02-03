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
          increment
        </button>
      </>
    );
  };

  const { getByText, findByText } = render(<Counter />);

  fireEvent.click(getByText("increment"));
  expect(renderCount).toBe(2);
  await findByText("count: 1");
});

it("can reset correctly", async () => {
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

it("re-renders when no custom isEqual is provided (because of different object instances)", async () => {
  const profileAtom = atom({
    firstName: "Mathieu",
    lastName: "Acthernoene",
  });

  let renderCount = 0;

  const Counter = () => {
    const profile = useAtom(profileAtom);
    renderCount++;

    return (
      <>
        <div>firstName: {profile.firstName}</div>
        <div>lastName: {profile.lastName}</div>

        <button
          onClick={() => {
            profileAtom.set({
              firstName: "Mathieu",
              lastName: "Acthernoene",
            });
          }}
        >
          update profile
        </button>
      </>
    );
  };

  const { getByText, findByText } = render(<Counter />);
  await findByText("firstName: Mathieu");
  await findByText("lastName: Acthernoene");

  fireEvent.click(getByText("update profile"));
  expect(renderCount).toBe(2);
});

it("can avoid re-render when a custom isEqual is provided", async () => {
  const profileAtom = atom({
    firstName: "Mathieu",
    lastName: "Acthernoene",
  });

  let renderCount = 0;

  const Counter = () => {
    const profile = useAtom(
      profileAtom,
      (prevValue, nextValue) =>
        `${prevValue.firstName} ${prevValue.lastName}` ===
        `${nextValue.firstName} ${nextValue.lastName}`,
    );

    renderCount++;

    return (
      <>
        <div>firstName: {profile.firstName}</div>
        <div>lastName: {profile.lastName}</div>

        <button
          onClick={() => {
            profileAtom.set({
              firstName: "Mathieu",
              lastName: "Acthernoene",
            });
          }}
        >
          update profile
        </button>
      </>
    );
  };

  const { getByText, findByText } = render(<Counter />);
  await findByText("firstName: Mathieu");
  await findByText("lastName: Acthernoene");

  fireEvent.click(getByText("update profile"));
  expect(renderCount).toBe(1);
});
