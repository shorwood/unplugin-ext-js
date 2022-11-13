import { mergeDeep } from '@hsjm/shared'
import { ExpressionStatement, SyntaxKind } from 'ts-morph'
import { analyseProperty } from './analyseProperty'
import { getNodeProperties, logTree } from './utils'
import { MetadataObject } from '~/types'

/**
 * Perform statical analysis on the Syntax Tree of an ExtJS Class.
 * @param node The node to extract metadata from.
 * @returns The extracted metadata.
 */
export const analyseClass = (node: ExpressionStatement): MetadataObject => {
  const expression = node.getExpression()
  const syntaxList = expression.getFirstChildByKindOrThrow(SyntaxKind.SyntaxList)
  const name = syntaxList.getChildAtIndexIfKindOrThrow(0, SyntaxKind.StringLiteral).getLiteralValue()
  const description = node.getLastChildByKind(SyntaxKind.JSDoc)?.getCommentText()

  // --- Analyse the class' properties and merge them.
  const propertiesArray = syntaxList
    .getFirstChildByKindOrThrow(SyntaxKind.ObjectLiteralExpression)
    .getPropertiesWithComments()
    .map(analyseProperty)
  const properties = mergeDeep(...propertiesArray)

  // --- Return the metadata.
  return {
    name,
    description,
    properties,
    kind: 'Class',
    filePath: node.getSourceFile().getFilePath(),
    fileName: node.getSourceFile().getBaseName(),
  }
}
