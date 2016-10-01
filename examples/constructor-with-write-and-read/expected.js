const privateAttributesOfExample = new WeakMap();

class Example {
  constructor(value) {
    privateAttributesOfExample.set(this, {});

    privateAttributesOfExample.get(this)._value = value;
    const temp = privateAttributesOfExample.get(this)._value;
  }
}
