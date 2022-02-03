import { cleanup, fireEvent, render } from "@testing-library/react";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { atom, useAtomWithSelector } from "../src";

afterEach(cleanup);

it("performs a basic example", async () => {
  const nameAtom = atom("");
  const setName = nameAtom.set;

  const Counter = () => {
    const upperName = useAtomWithSelector(nameAtom, (value) =>
      value.toUpperCase(),
    );

    React.useEffect(() => {
      setName("zoontek");
    }, []);

    return <div>name: {upperName}</div>;
  };

  const { findByText } = render(<Counter />);
  await findByText("name: ZOONTEK");
});

it("doesn't re-render if selection is equal", async () => {
  const profileAtom = atom({
    firstName: "Mathieu",
    lastName: "Acthernoene",
  });

  let renderCount = 0;

  const Counter = () => {
    const firstName = useAtomWithSelector(
      profileAtom,
      (value) => value.firstName,
    );

    renderCount++;

    return (
      <>
        <div>firstName: {firstName}</div>

        <button
          onClick={() => {
            profileAtom.set({
              firstName: "Mathieu",
              lastName: "Acthernoene",
            });
          }}
        >
          button
        </button>
      </>
    );
  };

  const { getByText, findByText } = render(<Counter />);

  fireEvent.click(getByText("button"));
  await findByText("firstName: Mathieu");

  expect(renderCount).toBe(1);
});
