import { mergeDeep } from '@hsjm/shared'
import { ExpressionStatement, SyntaxKind } from 'ts-morph'
import { analyseProperty } from './analyseProperty'
import { getExpressionProperties } from './utils'
import { MetadataObject } from '~/types'

/**
 * Extract metadata from an ExtJS class
 * @param node The node to extract metadata from.
 * @returns The extracted metadata.
 */
export const analyseClass = (node: ExpressionStatement): MetadataObject => {
  const name = node.getFirstDescendantByKindOrThrow(SyntaxKind.StringLiteral).getText().replace(/["']/g, '')
  const description = node.getLastChildByKind(SyntaxKind.JSDoc)?.getCommentText()

  // --- Analyse the class' properties and merge them.
  const allPropertiesArray = getExpressionProperties(node).map(analyseProperty)
  const allProperties = mergeDeep(...allPropertiesArray)
  const { extend, mixins, statics, inheritableStatics, ...properties } = allProperties

  // --- Extract extends and mixins.
  // const propertyExtends = extend?.defaultValue ? JSON.parse(extend.defaultValue) : undefined
  // const propertyMixins = mixins?.defaultValue ? JSON.parse(mixins.defaultValue) : undefined
  const propertyExtends = extend?.defaultValue?.replace(/["']/g, '') || undefined
  const propertyMixins = mixins?.defaultValue || undefined
  const inherits = [propertyExtends, propertyMixins].flat().filter(Boolean) as string[]

  // --- Extract statics and assign them to the class' properties.
  const allStatics = { ...statics?.properties, ...inheritableStatics?.properties }
  for (const staticProperty of Object.values(allStatics)) {
    staticProperty.isStatic = true
    properties[staticProperty.name] = staticProperty
  }

  // --- Return the metadata.
  return { name, description, properties, inherits }
}
