import { Node, PropertyAssignment, SyntaxKind } from 'ts-morph'
import { mapKeys, mergeDeep } from '@hsjm/shared'
import { analyseTags } from './analyseTags'
import { getNodeType } from './utils'
import { MetadataObject } from '~/types'

/**
 * Extract property metadata from an object or class.
 *
 * **Notice**: As **ExtJS** declares the type of properties with JSDoc comments,
 * We might extract multiple properties from a single property declaration.
 * This is not ideal, but it's the only way to get the metadata for
 * undefined or uninferable properties.
 *
 * @param node The node to extract metadata from.
 * @returns The extracted metadata entries.
 */
export const analyseProperty = (node: PropertyAssignment): Record<string, MetadataObject> => {
  const expression = node.getInitializerOrThrow()
  const comments = node.getChildrenOfKind(SyntaxKind.JSDoc)

  // --- Initialize the property metadata.
  const metadataFromProperty: MetadataObject = {
    name: node.getName(),
    kind: expression.getKindName(),
    type: getNodeType(expression),
  }

  // --- Get the default value if primitive.
  if (!expression.isKind(SyntaxKind.FunctionDeclaration)
    && !expression.isKind(SyntaxKind.FunctionExpression)
    && !expression.isKind(SyntaxKind.ObjectLiteralExpression)
    && !expression.isKind(SyntaxKind.ArrayLiteralExpression)
  ) metadataFromProperty.defaultValue = expression.getText().trim()

  // --- If property is an object, analyse it's properties.
  if (Node.isObjectLiteralExpression(expression)) {
    const propertiesArray = expression
      .getChildSyntaxListOrThrow()
      .getChildrenOfKind(SyntaxKind.PropertyAssignment)
      .map(analyseProperty)
    metadataFromProperty.properties = mergeDeep(...propertiesArray)
  }

  // --- If property is a function, extract it's signature.
  if (Node.isFunctionExpression(expression)) {
    const parameters = expression
      .getParameters()
      .map(parameter => ({
        name: parameter.getName(),
        type: getNodeType(parameter),
      }))
    metadataFromProperty.parameters = mapKeys(parameters, 'name')

    // --- Extract return type.
    try { metadataFromProperty.returnType = expression.getReturnType().getText() }
    catch {}
  }

  // --- Extract metadata from the JSDoc comments.
  const metadataFromComment = comments.map(analyseTags)
  const metadataAll = [metadataFromProperty, ...metadataFromComment]
    .map((x) => {
      if (!x.name) x.name = metadataFromProperty.name
      return { [x.name]: x as MetadataObject }
    })

  // --- Return the metadata.
  return mergeDeep(...metadataAll)
}
