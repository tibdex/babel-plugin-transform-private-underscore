import { isClassDeclaration, isClassExpression, isClassMethod } from 'babel-types';

const getClassName = (classBodyPath) => {
  const parent = classBodyPath.parent;
  return (isClassDeclaration(parent) || isClassExpression(parent)) && parent.id
    ? parent.id.name
    : 'Anonymous';
};

const getPrivateMethodsNames = classBodyPath => classBodyPath.node.body
  .filter(isClassMethod)
  .map(node => node.key.name)
  .filter(name => name.startsWith('_'));

const getConstructorPath = classBodyPath => classBodyPath.get('body')
  .find(path => path.isClassMethod() && path.node.kind === 'constructor');

const getFirstPathWhereVariableCanBeDeclaredInParentHierarchy = path => (
  path.node.body
  ? path
  : getFirstPathWhereVariableCanBeDeclaredInParentHierarchy(path.parentPath)
);

const getExternalizedPrivatePropertiesDeclarationSiblingPath = (classBodyPath, position = 0) =>
  getFirstPathWhereVariableCanBeDeclaredInParentHierarchy(classBodyPath.parentPath.parentPath).get(`body.${position}`);

export {
  getClassName,
  getPrivateMethodsNames,
  getConstructorPath,
  getExternalizedPrivatePropertiesDeclarationSiblingPath
};
