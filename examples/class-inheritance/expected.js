const privateAttributesOfChild = new WeakMap();

class Parent {}

class Child extends Parent {
  constructor(value) {
    super();

    privateAttributesOfChild.set(this, {});

    privateAttributesOfChild.get(this)._value = value;
  }
}

