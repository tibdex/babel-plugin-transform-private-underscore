[![CircleCI](https://circleci.com/gh/tibdex/babel-plugin-transform-private-underscore.svg?style=svg)](https://circleci.com/gh/tibdex/babel-plugin-transform-private-underscore)

This Babel plugin transforms class declarations to make properties starting with an underscore truly private.

The following code:

```javascript
export default class Person {
  constructor() {
    this._firstName = 'John';
    this._lastName = 'Doe';
  }
  
  setFirstName(firstName) {
    this._firstName = firstName;
  }
  
  setLastName(lastName) {
    this._lastName = lastName;
  }
  
  sayHi() {
    console.log(this._getFullName());
  }
  
  _getFullName() {
    return `${this._firstName} ${this._lastName}`;
  }
}
```

Will be transpiled to:

```javascript
const privateAttributesOfPerson = new WeakMap();

const privateMethodsOfPerson = {
  _getFullName(instanceOfPerson) {
    return `${ privateAttributesOfPerson.get(instanceOfPerson)._firstName } ${ privateAttributesOfPerson.get(instanceOfPerson)._lastName }`;
  }
};

export default class Person {
  constructor() {
    privateAttributesOfPerson.set(this, {});

    privateAttributesOfPerson.get(this)._firstName = 'John';
    privateAttributesOfPerson.get(this)._lastName = 'Doe';
  }

  setFirstName(firstName) {
    privateAttributesOfPerson.get(this)._firstName = firstName;
  }

  setLastName(lastName) {
    privateAttributesOfPerson.get(this)._lastName = lastName;
  }

  sayHi() {
    console.log(privateMethodsOfPerson._getFullName(this));
  }
}
```

Private attributes are moved to a WeakMap and private methods are externalized into a regular JS object. These transformations should not introduce any performance penalty.
