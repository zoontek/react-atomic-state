import { cleanup, fireEvent, render } from "@testing-library/react";
import * as React from "react";
import { afterEach, expect, it } from "vitest";
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

it("doesn't re-render if selection is equal to the previous one", async () => {
  const profileAtom = atom({
    firstName: "Mathieu",
    lastName: "Acthernoene",
  });

  let renderCount = 0;

  const Counter = () => {
    useAtomWithSelector(profileAtom, (value) => value.firstName);
    renderCount++;

    return (
      <button
        onClick={() => {
          profileAtom.set({
            firstName: "Mathieu",
            lastName: "Breton",
          });
        }}
      >
        update profile
      </button>
    );
  };

  const { getByText } = render(<Counter />);

  fireEvent.click(getByText("update profile"));
  expect(renderCount).toBe(1);
});

it("can avoid re-render when a custom isEqual is provided", async () => {
  const profileAtom = atom({
    firstName: "Mathieu",
    lastName: "Acthernoene",
    friends: [
      { firstName: "Matthias", lastName: "Le Brun" },
      { firstName: "Maxime", lastName: "Thirouin" },
    ],
  });

  let renderCount = 0;

  const Counter = () => {
    const friendsCount = useAtomWithSelector(
      profileAtom,
      (value) => value.friends.length,
    );

    renderCount++;

    return (
      <>
        <div>friendsCount: {friendsCount}</div>

        <button
          onClick={() => {
            profileAtom.set((prevValue) => ({
              ...prevValue,
              friends: [
                ...prevValue.friends,
                { firstName: "Georges", lastName: "Mathieu" },
              ],
            }));
          }}
        >
          add friend
        </button>
      </>
    );
  };

  const { getByText, findByText } = render(<Counter />);
  await findByText("friendsCount: 2");

  fireEvent.click(getByText("add friend"));
  expect(renderCount).toBe(2);
  await findByText("friendsCount: 3");
});
