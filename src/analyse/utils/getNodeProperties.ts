import { Node, SyntaxKind } from 'ts-morph'
import { tries } from '@hsjm/shared'

/**
 * Extract all properties from an object or class.
 * @param node The node to extract statements from.
 * @returns The extracted `ExpressionStatement`.
 */
export const getNodeProperties = (node: Node): Node[] => {
  const expression = Node.isExpressionStatement(node)
    ? node.getExpression()
    : node

  const objectNode = tries(
    // --- Get the first object.
    () => expression
      .getFirstChildByKindOrThrow(SyntaxKind.ObjectLiteralExpression)
      .getPropertiesWithComments()

    // --- Or get the first constructor return statement.
    () => expression
      .getFirstChildByKindOrThrow(SyntaxKind.FunctionExpression)
      .getFirstDescendantByKindOrThrow(SyntaxKind.ReturnStatement)
      .getFirstChildByKindOrThrow(SyntaxKind.ObjectLiteralExpression),

    // --- Fall back to the expression itself.
    () => node.getChildSyntaxListOrThrow(),
  )

  // --- Return empty object if no class object found.
  if (!objectNode) return []

  console.log({
    objectKind: objectNode.getKindName(),
    children: objectNode.getChildren().map(child => child.getKindName()),
  })

  // --- Return the properties of the object.
  return objectNode

    .getChildren()
    .filter(child => Node.isPropertyAssignment(child)
      || Node.isShorthandPropertyAssignment(child)
      || Node.isMethodDeclaration(child)
      || Node.isSetAccessorDeclaration(child)
      || Node.isGetAccessorDeclaration(child)
      || Node.isConstructorDeclaration(child))
}
