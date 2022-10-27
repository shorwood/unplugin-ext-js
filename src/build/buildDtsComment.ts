import { buildDtsCommentParameters } from './buildDtsCommentParameters'
import { MetadataObject } from '~/types'

/**
 * Generate a JSDoc comment.
 * @param {import('./types').MetadataObjectProp} metadata The metadata to generate a JSDoc comment for.
 * @returns {string} The generated JSDoc comment.
 */
export const buildDtsComment = (metadata: MetadataObject) => {
  // --- Destructure properties.
  const {
    description,
    defaultValue,
    since,
    example,
    parameters,
    returnType,
    returnDescription,
    isStatic,
    isPrivate,
  } = metadata

  // --- Generate the `@returns` tag.
  let returnTag = ''
  if (returnType && returnDescription) returnTag = `@return {${returnType}} ${returnDescription}`
  else if (returnType) returnTag = `@return {${returnType}}`
  else if (returnDescription) returnTag = `@return ${returnDescription}`

  // --- Generate JSDoc.
  const comment = [
    description,
    defaultValue && defaultValue.length < 16 && `@default ${defaultValue}`,
    parameters && `\n${buildDtsCommentParameters(parameters)}`,
    returnTag,
    since && `@since \`${since}\``,
    example && `@example\n${example}`,
    isStatic && '@static',
    isPrivate && '@private',
  ]
    .filter(Boolean)
    .join('\n')
    .trim()
    .split('\n')
    .map(x => ` * ${x}`.trimEnd())
    .join('\n')

  // --- Return nothing if no comment.
  if (comment.length < 10) return ''

  return `/**\n${comment}\n */`
}
