const privateAttributesOfExample = new WeakMap();

const privateMethodsOfExample = {
  _get(instanceOfExample, fallback) {
    return privateAttributesOfExample.get(instanceOfExample)._value || fallback;
  }
};

class Example {
  constructor(value) {
    privateAttributesOfExample.set(this, {});

    privateAttributesOfExample.get(this)._value = value;
  }

  get(fallback) {
    return privateMethodsOfExample._get(this, fallback);
  }
}
