const privateAttributesOfExample = new WeakMap();

export default class Example {
  constructor(value) {
    privateAttributesOfExample.set(this, {});

    privateAttributesOfExample.get(this)._value = value;
  }
}
