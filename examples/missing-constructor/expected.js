const privateAttributesOfExample = new WeakMap();

class Example {
  constructor() {
    privateAttributesOfExample.set(this, {});
  }

  set(value) {
    privateAttributesOfExample.get(this)._value = value;
    return this;
  }

  get() {
    return privateAttributesOfExample.get(this)._value;
  }
}
