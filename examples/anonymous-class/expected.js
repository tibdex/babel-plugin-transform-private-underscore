const privateAttributesOfAnonymous = new WeakMap();

const Example = class {
  constructor(value) {
    privateAttributesOfAnonymous.set(this, {});

    privateAttributesOfAnonymous.get(this)._value = value;
  }
};
