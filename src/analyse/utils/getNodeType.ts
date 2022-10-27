import { Node } from 'ts-morph'
import { tries } from '@hsjm/shared'

/**
 * Extract the type of a node.
 * @param node The node to extract the type from.
 * @returns The extracted type.
 */
export const getNodeType = (node: Node): string | undefined => {
  // --- Get array type.
  if (Node.isArrayLiteralExpression(node)) {
    const types = node.getElements().map(getNodeType).filter(Boolean)
    const typesUnique = [...new Set(types)]
    const typesString = typesUnique.join(' | ')
    return typesString ? `${typesString}[]` : undefined
  }

  // --- If node is a `JSDocTypeTag` or `JSDocParameterTag`, extract the type.
  if (Node.isJSDocTypeTag(node) || Node.isJSDocParameterTag(node))
    return node.getTypeExpression()?.getTypeNode().getText()

  // --- If node is a `JSDocReturnTag`, extract the type.
  if (Node.isJSDocReturnTag(node))
    return node.getTypeExpression()?.getTypeNode().getText()

  // --- Get object type.
  return tries(
    () => node.getType().getBaseTypeOfLiteralType().getText(),
    () => node.getType().getLiteralRegularTypeOrThrow().getText(),
    () => node.getType().getTargetTypeOrThrow().getText(),
  )
}
