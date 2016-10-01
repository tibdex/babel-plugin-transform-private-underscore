import { identifier } from 'babel-types';

const getPrivateMethodsMap = className => identifier(`privateMethodsOf${className}`);
const getClassInstance = className => identifier(`instanceOf${className}`);
const getWeakMap = className => identifier(`privateAttributesOf${className}`);

export {
  getPrivateMethodsMap,
  getClassInstance,
  getWeakMap
};
