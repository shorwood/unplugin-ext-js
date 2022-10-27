import { Node, PropertyAssignment, SyntaxKind } from 'ts-morph'
import { mapKeys, mergeDeep, set } from '@hsjm/shared'
import { analyseTags } from './analyseTags'
import { getNodeType } from './utils'
import { MetadataObject } from '~/types'

/**
 * Extract property metadata from an object or class.
 *
 * **Notice**: As **ExtJS** declares the type of properties with `@cfg` and `@property`
 * tags, . This is not ideal, but it's the only way to get the metadata for
 * undefined or uninferable properties.
 *
 * @param node The node to extract metadata from.
 * @returns The extracted metadata entries.
 */
export const analyseProperty = (node: PropertyAssignment): Record<string, MetadataObject> => {
  const expression = node.getInitializerOrThrow()
  const comments = node.getChildrenOfKind(SyntaxKind.JSDoc)

  // --- Initialize the property metadata.
  let metadataOfAssignment: Partial<MetadataObject> = {
    name: node.getName(),
    kind: expression.getKindName(),
    type: getNodeType(expression),
    description: comments[0]?.getCommentText(),
  }

  // --- Get the default value if primitive.
  if (!expression.isKind(SyntaxKind.FunctionDeclaration)
    && !expression.isKind(SyntaxKind.FunctionExpression)
    && !expression.isKind(SyntaxKind.ObjectLiteralExpression)
    && !expression.isKind(SyntaxKind.ArrayLiteralExpression)
  ) metadataOfAssignment.defaultValue = expression.getText().trim()

  // --- If property is an object, analyse it's properties.
  if (Node.isObjectLiteralExpression(expression)) {
    const propertiesArray = expression
      .getChildSyntaxListOrThrow()
      .getChildrenOfKind(SyntaxKind.PropertyAssignment)
      .map(analyseProperty)
    metadataOfAssignment.properties = mergeDeep(...propertiesArray)
  }

  // --- If property is a function, extract it's signature.
  if (Node.isFunctionExpression(expression)) {
    const parameters = expression
      .getParameters()
      .map(parameter => ({
        name: parameter.getName(),
        type: getNodeType(parameter),
      }))
    metadataOfAssignment.parameters = mapKeys(parameters, 'name')

    // --- Rebuilt the parent's JSDoc comment.
    const comment = comments.pop()
    if (comment) {
      const metadataComment = analyseTags(comment)
      metadataOfAssignment = mergeDeep(metadataOfAssignment, metadataComment)
    }

    // --- Extract return type.
    try { metadataOfAssignment.returnType = expression.getReturnType().getText() }
    catch {}
  }

  // --- Extract metadata from the JSDoc comments.
  const metadataComments = comments.map(analyseTags)
  const metadataAll = [metadataOfAssignment, ...metadataComments].filter(x => x.name) as MetadataObject[]

  // --- Build the final metadata object.
  const metadata = {} as Record<string, MetadataObject>
  for (const { name, ...rest } of metadataAll) {
    const pathParts = name.split('.')
    const path = pathParts.join('.properties.')
    const newName = pathParts.pop()

    for (const [index, part] of pathParts.entries()) {
      if (index === 0) continue
      const path = pathParts.slice(0, index + 1).join('.properties.')
      const pathName = `${path}.name`
      set (metadata, pathName, part)
    }

    set(metadata, path, { name: newName, ...rest })
  }

  // --- Return the metadata.
  return metadata
}
