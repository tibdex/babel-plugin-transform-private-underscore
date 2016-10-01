class Example {
  constructor(value) {
    this._value = value;
  }

  get(fallback) {
    return this._get(fallback);
  }

  _get(fallback) {
    return this._value || fallback;
  }
}
