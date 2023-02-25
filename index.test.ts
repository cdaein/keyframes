import { test, describe, expect } from "vitest";
import Keyframes from "./index";

// TODO: update rest of the tests

describe("simple", () => {
  var keys = [
    { time: 0, value: [0, 0] },
    { time: 1, value: [10, 5] },
  ];

  const timeline = new Keyframes(keys);
  const array = [0, 0];
  const newArray = timeline.value(0.5, undefined, array);

  test("re-uses array", () => {
    expect(newArray).toStrictEqual(array);
  });

  test("interpolates array", () => {
    expect(newArray).toStrictEqual([5, 2.5]);
  });

  // timeline.value(
  //   0.5,
  //   function (start, end, time, out) {
  //     out[0] = 50;
  //     out[1] = 25;
  //     // t.deepEqual(start, keys[0], "gets first");
  //     // t.deepEqual(end, keys[1], "gets last");
  //     // t.equal(time, 0.5, "gets time");
  //   },
  //   array
  // );

  // test("gets custom interpolation", () => {
  //   expect(array).toStrictEqual([50, 25]);
  // });

  test("first keyframe", () => {
    expect(timeline.value(-1)).toStrictEqual([0, 0]);
  });

  test("last keyframe", () => {
    expect(timeline.value(1000)).toStrictEqual([10, 5]);
  });
});

test("timeline controls", () => {
  const keys = [
    { time: 2, value: 1 },
    { time: 4, value: 2 },
    { time: 0, value: 3 },
  ];
  const sorted = [
    { time: 0, value: 3 },
    { time: 2, value: 1 },
    { time: 4, value: 2 },
  ];

  const c1 = new Keyframes(keys);

  test("count is correct", () => {
    expect(c1.count).toEqual(3);
  });

  test("the keys are sorted", () => {
    expect(c1.frames).toStrictEqual(sorted);
  });

  test("nearest with small radius returns null", () => {
    expect(c1.nearest(3.5, 0.4)).toStrictEqual(null);
  });

  test("nearest finds nearest keyframe", () => {
    expect(c1.nearest(3.5)).toStrictEqual(sorted[2]);
  });

  test("get strict", () => {
    expect(c1.get(1)).toStrictEqual(null);
    expect(c1.get(2)).toStrictEqual(sorted[1]);
  });

  test("jumps to next keyframe", () => {
    expect(c1.next(-1)).toStrictEqual(sorted[0]);
    expect(c1.next(0.5)).toStrictEqual(sorted[1]);
    expect(c1.next(2)).toStrictEqual(sorted[2]);
    expect(c1.next(4)).toStrictEqual(null);
    expect(c1.next(4.5)).toStrictEqual(null);
  });

  test("jumps to previous keyframe", () => {
    expect(c1.previous(-1)).toStrictEqual(null);
    expect(c1.previous(0.5)).toStrictEqual(sorted[0]);
    expect(c1.previous(2)).toStrictEqual(sorted[0]);
    expect(c1.previous(4)).toStrictEqual(sorted[1]);
    expect(c1.previous(4.5)).toStrictEqual(sorted[2]);
  });

  test("interpolation", () => {
    expect(c1.value(0)).toEqual(3);
    expect(c1.value(1)).toEqual(2);
    expect(c1.value(-1)).toEqual(3);
    expect(c1.value(4)).toEqual(2);
    expect(c1.value(3)).toEqual(1.5);
    expect(c1.value(5)).toEqual(2);
  });

  const idx = c1.nearestIndex(4);
  c1.splice(idx, 1);
  sorted.splice(idx, 1);

  test("splice works", () => {
    expect(c1.frames).toStrictEqual(sorted);
  });

  const newItem = { time: 10, value: 1 };
  c1.splice(0, 0, newItem);
  sorted.splice(0, 0, newItem);

  test("splice insert re-sorts array", () => {
    expect(c1.frames).not.toStrictEqual(sorted);
  });

  const two = new Keyframes([{ time: 0, value: 50 }]);

  test("", () => {
    expect(two.previous(100)).toStrictEqual(two.frames[0]);
    expect(two.next(100)).toStrictEqual(null);
  });
});
