import * as t from 'babel-types';

import * as identifiers from './identifiers';
import * as predicates from './predicates';
import * as templates from './templates';
import * as utils from './utils';

const replacePrivateMethodsCallsByExternalizedOnes = (classBodyPath, privateMethodsNames) => {
  const className = utils.getClassName(classBodyPath);

  classBodyPath.traverse({
    CallExpression(callExpressionPath) {
      if (predicates.isPrivateMethodCall(callExpressionPath.node, privateMethodsNames)) {
        const methodName = callExpressionPath.node.callee.property.name;

        callExpressionPath.replaceWith(t.callExpression(
          t.memberExpression(
            identifiers.getPrivateMethodsMap(className),
            t.identifier(methodName)
          ),
          [
            t.thisExpression(),
            ...callExpressionPath.node.arguments
          ]
        ));
      }
    }
  });
};

const checkIfHasPrivateAttributesAndReplaceThemByWeakMapAccess = (classBodyPath, privateMethodsNames) => {
  const className = utils.getClassName(classBodyPath);
  let hasPrivateAttributes = false;

  classBodyPath.traverse({
    MemberExpression(memberExpressionPath) {
      if (predicates.isPrivateAttributeAccess(memberExpressionPath.node, privateMethodsNames)) {
        hasPrivateAttributes = true;
        const attributeName = memberExpressionPath.node.property.name;
        memberExpressionPath.replaceWith(templates.makeWeakMapRead({
          WEAK_MAP: identifiers.getWeakMap(className),
          PROPERTY: t.identifier(attributeName)
        }));
      }
    }
  });

  return hasPrivateAttributes;
};

const declareAndInitializeWeakMap = (classBodyPath) => {
  const className = utils.getClassName(classBodyPath);
  const weakMapIdentifier = identifiers.getWeakMap(className);
  utils.getExternalizedPrivatePropertiesDeclarationSiblingPath(classBodyPath)
    .insertBefore(templates.makeWeakMapDeclaration({ WEAK_MAP: weakMapIdentifier }));

  const weakMapInitialization = templates.makeWeakMapInitialization({ WEAK_MAP: weakMapIdentifier });
  const constructorPath = utils.getConstructorPath(classBodyPath);
  if (constructorPath) {
    const firstStatementPath = constructorPath.get('body.body.0');
    if (utils.isSuperConstructionCall(firstStatementPath)) {
      firstStatementPath.insertAfter(weakMapInitialization);
    } else {
      firstStatementPath.insertBefore(weakMapInitialization);
    }
  } else {
    const firstMethodPath = classBodyPath.get('body').find(path => path.isClassMethod());
    firstMethodPath.insertBefore(t.classMethod(
      'constructor',
      t.identifier('constructor'),
      [],
      t.blockStatement([weakMapInitialization])
    ));
  }
};

const declarePrivateMethodsMap = (classBodyPath, privateMethodsNames) => {
  const className = utils.getClassName(classBodyPath);

  return utils.getExternalizedPrivatePropertiesDeclarationSiblingPath(classBodyPath, 1).insertBefore(
    t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          identifiers.getPrivateMethodsMap(className),
          t.objectExpression(
            classBodyPath.node.body
              .filter(node => privateMethodsNames.indexOf(node.key.name) !== -1)
              .map(node => t.objectMethod(
                'method',
                node.key,
                [
                  identifiers.getClassInstance(className),
                  ...node.params
                ],
                node.body
              ))
          )
        )
      ]
    )
  )[0];
};

const replaceThisExpressionByClassInstanceVariable = (path, className) => {
  path.traverse({
    ThisExpression(thisExpressionPath) {
      thisExpressionPath.replaceWith(identifiers.getClassInstance(className));
    }
  });
};

const removePrivateMethodsFromClassBody = (classBodyPath, privateMethodsNames) => {
  classBodyPath.traverse({
    ClassMethod(classMethodPath) {
      if (privateMethodsNames.indexOf(classMethodPath.node.key.name) !== -1) {
        classMethodPath.remove();
      }
    }
  });
};

const externalizePivateMethods = (classBodyPath, privateMethodsNames) => {
  const privateMethodsMapPath = declarePrivateMethodsMap(classBodyPath, privateMethodsNames);
  replaceThisExpressionByClassInstanceVariable(privateMethodsMapPath, utils.getClassName(classBodyPath));
  removePrivateMethodsFromClassBody(classBodyPath, privateMethodsNames);
};

const makePropertiesStartingWithAnUnderscoreTrulyPrivate = (classBodyPath) => {
  const privateMethodsNames = utils.getPrivateMethodsNames(classBodyPath);

  if (privateMethodsNames.length) {
    replacePrivateMethodsCallsByExternalizedOnes(classBodyPath, privateMethodsNames);
  }

  if (checkIfHasPrivateAttributesAndReplaceThemByWeakMapAccess(classBodyPath, privateMethodsNames)) {
    declareAndInitializeWeakMap(classBodyPath);
  }

  if (privateMethodsNames.length) {
    externalizePivateMethods(classBodyPath, privateMethodsNames);
  }
};

const traverseWithClassBodyVisitor = (path) => {
  path.traverse({
    ClassBody(classBodyPath) {
      makePropertiesStartingWithAnUnderscoreTrulyPrivate(classBodyPath);
    }
  });
};

export default () => ({
  // Using classDeclaration and classExpression instead of only ClassBody to be called before transfrom-es2015-classes
  visitor: {
    ClassDeclaration(path) {
      traverseWithClassBodyVisitor(path);
    },
    ClassExpression(path) {
      traverseWithClassBodyVisitor(path);
    }
  }
});
