# Goal

This Babel plugin transforms class declarations to make properties starting with an underscore truly private.

Private attributes are moved to a WeakMap and private methods are externalized into a regular JS object. These transformations should not introduce any performance penalty.

**Note**: I don't maintain this package anymore because I adopted a more functional approach to programming where this kind of encapsulation is not needed.

# Installation

```bash
npm install --save-dev babel-plugin-transform-private-underscore
```

# Usage

Add the plugin to your `.babelrc` file. It could look like that:

```json
{
  "presets": ["es2015"],
  "plugins": ["transform-private-underscore"]
}
```

# Example

The following code:

```javascript
export default class Person {
  constructor() {
    this._firstName = "John";
    this._lastName = "Doe";
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
    return `${privateAttributesOfPerson.get(instanceOfPerson)._firstName} ${
      privateAttributesOfPerson.get(instanceOfPerson)._lastName
    }`;
  }
};

export default class Person {
  constructor() {
    privateAttributesOfPerson.set(this, {});

    privateAttributesOfPerson.get(this)._firstName = "John";
    privateAttributesOfPerson.get(this)._lastName = "Doe";
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

The transpiled code used in the console gives this:

![Usage in the console](https://raw.githubusercontent.com/tibdex/babel-plugin-transform-private-underscore/master/resources/console.png)

Take a look at the [examples folder](https://github.com/tibdex/babel-plugin-transform-private-underscore/tree/master/examples) to see all the cases tested against the plugin.
