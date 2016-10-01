import template from 'babel-template';

const makeWeakMapDeclaration = template('const WEAK_MAP = new WeakMap();');
const makeWeakMapInitialization = template('WEAK_MAP.set(this, {})');
const makeWeakMapRead = template('WEAK_MAP.get(this).PROPERTY');

export {
  makeWeakMapDeclaration,
  makeWeakMapInitialization,
  makeWeakMapRead
};
