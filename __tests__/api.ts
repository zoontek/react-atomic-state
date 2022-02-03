import { atom } from "../src";

it("matches existing api", () => {
  const nullAtom = atom(null);

  expect(nullAtom).toMatchInlineSnapshot(`
    Object {
      "get": [Function],
      "reset": [Function],
      "set": [Function],
      "subscribe": [Function],
    }
  `);
});

it("performs get / set / reset", () => {
  const countAtom = atom(0);
  expect(countAtom.get()).toBe(0);

  countAtom.set(1);
  expect(countAtom.get()).toBe(1);

  countAtom.set((prevCount) => prevCount + 1);
  expect(countAtom.get()).toBe(2);

  countAtom.reset();
  expect(countAtom.get()).toBe(0);
});

it("subscribes to atom value changes", () => {
  const countAtom = atom(0);
  const callback = jest.fn();

  countAtom.subscribe(callback);

  countAtom.set((prevCount) => prevCount + 1);
  expect(callback).toHaveBeenCalledWith(1);

  countAtom.set((prevCount) => prevCount + 1);
  expect(callback).toHaveBeenCalledWith(2);

  countAtom.set((prevCount) => prevCount + 1);
  expect(callback).toHaveBeenCalledWith(3);

  expect(callback).toHaveBeenCalledTimes(3);
});
