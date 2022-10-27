import { ExpressionStatement, PropertyAssignment, SyntaxKind } from 'ts-morph'
import { tries } from '@hsjm/shared'

/**
 * Extract all `PropertyAssignment` of an `ExpressionStatement`.
 * @param node The node to extract statements from.
 * @returns The extracted `ExpressionStatement`.
 */
export const getExpressionProperties = (node: ExpressionStatement): PropertyAssignment[] => {
  const expression = node.getExpression()
  const objectNode = tries(
    // --- Get the first object.
    () => expression
      .getFirstChildByKindOrThrow(SyntaxKind.ObjectLiteralExpression),

    // --- Or get the first constructor return statement.
    () => expression
      .getFirstChildByKindOrThrow(SyntaxKind.FunctionExpression)
      .getFirstDescendantByKindOrThrow(SyntaxKind.ReturnStatement)
      .getFirstChildByKindOrThrow(SyntaxKind.ObjectLiteralExpression),
  )

  // --- Return empty object if no class object found.
  return objectNode ? objectNode.getChildrenOfKind(SyntaxKind.PropertyAssignment) : []
}
