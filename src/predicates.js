import { isThisExpression } from 'babel-types';

const isPrivateProperyAccess = (memberExpressionNode, privateMethodsNames) =>
  isThisExpression(memberExpressionNode.object)
  && memberExpressionNode.property.name.startsWith('_');

const isPrivateMethodCall = (callExpressionNode, privateMethodsNames) =>
  isPrivateProperyAccess(callExpressionNode.callee, privateMethodsNames)
  && privateMethodsNames.indexOf(callExpressionNode.callee.property.name) !== -1;

const isPrivateAttributeAccess = (memberExpressionNode, privateMethodsNames) =>
  isPrivateProperyAccess(memberExpressionNode, privateMethodsNames)
  && privateMethodsNames.indexOf(memberExpressionNode.property.name) === -1;

export {
  isPrivateMethodCall,
  isPrivateAttributeAccess
};
