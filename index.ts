import { interpolate } from "@daeinc/geom";

export type Frame = {
  time: number;
  value: any | any[]; // REVIEW: any or unknown?
  [key: string]: any;
};

export type Interpolator = (a: Frame, b: Frame, t: number, out?: any[]) => any;

const setArray = (out: number[], ...values: number[]) => {
  for (let i = 0; i < values.length; i++) {
    out[i] = values![i];
  }
  return out;
};

const sort = (a: Frame, b: Frame) => {
  return a.time - b.time;
};

const temp = [0, 0, 0];

export default class Keyframes {
  frames!: Frame[];

  /**
   * @param frames - Array of `Frame` objects to initialize with.
   * @param sorted -
   */
  constructor(frames?: Frame[], sorted?: boolean) {
    if (!(this instanceof Keyframes)) return new Keyframes(frames, sorted);
    this.frames = frames || [];
    if (!sorted) this.sort();
  }

  /**
   * Finds the index of the nearest keyframe to the given time stamp.
   * If radius is specified, it will return the nearest only within that radius
   *
   * @param time -
   * @param radius -
   * @returns
   */
  nearestIndex(time: number, radius?: number) {
    radius = typeof radius === "number" ? radius : Number.MAX_VALUE;
    let minDist = Number.MAX_VALUE;
    let nearest = -1;
    for (let i = 0; i < this.frames.length; i++) {
      const dist = Math.abs(this.frames[i].time - time);
      if (dist < minDist && dist <= radius) {
        minDist = dist;
        nearest = i;
      }
    }
    return nearest;
  }

  /**
   * Gets the keyframe at the index
   * @param time -
   * @param radius -
   * @returns
   */
  nearest(time: number, radius?: number) {
    const idx = this.nearestIndex(time, radius);
    return idx === -1 ? null : this.frames[idx];
  }

  /**
   * Gets the keyframe at time
   * @param time -
   * @returns
   */
  get(time: number) {
    return this.nearest(time, 0);
  }

  /**
   * Gets the keyframe index at time
   * @param time -
   * @returns
   */
  getIndex(time: number) {
    return this.nearestIndex(time, 0);
  }

  /**
   * Lerps the value at the specified time stamp.
   * Returns `null` if no keyframes exist
   * @param time -
   * @param interpolator -
   * @param out -
   * @returns
   */
  value(time: number, interpolator?: Interpolator, out?: any[]) {
    const v = this.interpolation(time);
    if (v[0] === -1 || v[1] === -1) return null;

    const startFrame = this.frames[v[0]];
    const endFrame = this.frames[v[1]];
    const t = v[2];

    //We interpolator from left keyframe to right, with a custom easing
    //equation if specified
    if (typeof interpolator === "function")
      return interpolator(startFrame, endFrame, t, out);

    //Otherwise we assume the values are simple numbers and lerp them
    return interpolate(startFrame.value, endFrame.value, t, out);
  }

  interpolation(time: number) {
    if (this.frames.length === 0) return setArray(temp, -1, -1, 0);

    let prev = -1;
    //get last keyframe to time
    for (let i = this.frames.length - 1; i >= 0; i--) {
      if (time >= this.frames[i].time) {
        prev = i;
        break;
      }
    }

    //start or end keyframes
    if (prev === -1 || prev === this.frames.length - 1) {
      if (prev < 0) prev = 0;
      return setArray(temp, prev, prev, 0);
    } else {
      const startFrame = this.frames[prev];
      const endFrame = this.frames[prev + 1];

      //clamp and get range
      time = Math.max(startFrame.time, Math.min(time, endFrame.time));
      const t = (time - startFrame.time) / (endFrame.time - startFrame.time);

      //provide interpolation factor
      return setArray(temp, prev, prev + 1, t);
    }
  }

  next(time: number) {
    if (this.frames.length < 1) return null;

    let cur = -1;
    //get last keyframe to time
    for (let i = 0; i < this.frames.length; i++) {
      if (time < this.frames[i].time) {
        cur = i;
        break;
      }
    }
    return cur === -1 ? null : this.frames[cur];
  }

  previous(time: number) {
    if (this.frames.length < 1) return null;

    let cur = -1;
    //get last keyframe to time
    for (let i = this.frames.length - 1; i >= 0; i--) {
      if (time > this.frames[i].time) {
        cur = i;
        break;
      }
    }
    return cur === -1 ? null : this.frames[cur];
  }

  /**
   * Adds a frame at the given time stamp
   * @param frame -
   */
  add(frame: Frame) {
    this.frames.push(frame);
    this.sort();
  }

  /**
   * Convenience for `this.frames.splice`.
   * If items are inserted, a sort will be applied after insertion
   * @param index -
   * @param howmany -
   * @param  -
   */
  splice(index: number, howmany: number, ...itemsN: Frame[]) {
    this.frames.splice.apply(this.frames, [index, howmany, ...itemsN]);
    if (arguments.length > 2) this.sort();
  }

  /**
   * Sorts the keyframes. you should do this after adding new keyframes that are not in linear time.
   */
  sort() {
    this.frames.sort(sort);
  }

  /**
   * Clears the keyframe list
   */
  clear() {
    this.frames.length = 0;
  }

  get count() {
    return this.frames.length;
  }
}
