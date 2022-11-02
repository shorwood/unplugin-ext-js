import { mergeDeep } from '@hsjm/shared'
import { ExpressionStatement, SyntaxKind } from 'ts-morph'
import { analyseProperty } from './analyseProperty'
import { getExpressionProperties } from './utils'
import { MetadataObject } from '~/types'

/**
 * Perform statical analysis on the Syntax Tree of an ExtJS Class.
 * @param node The node to extract metadata from.
 * @returns The extracted metadata.
 */
export const analyseClass = (node: ExpressionStatement): MetadataObject => {
  const name = node.getFirstDescendantByKindOrThrow(SyntaxKind.StringLiteral).getText().replace(/["']/g, '')
  const description = node.getLastChildByKind(SyntaxKind.JSDoc)?.getCommentText()

  // --- Analyse the class' properties and merge them.
  const propertiesArray = getExpressionProperties(node).map(analyseProperty)
  const properties = mergeDeep(...propertiesArray)

  // --- Return the metadata.
  return { name, description, properties, kind: 'Class' }
}
