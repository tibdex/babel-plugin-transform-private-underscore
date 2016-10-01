const privateAttributesOfExample = new WeakMap();

export class Example {
  constructor(value) {
    privateAttributesOfExample.set(this, {});

    privateAttributesOfExample.get(this)._value = value;
  }
}
