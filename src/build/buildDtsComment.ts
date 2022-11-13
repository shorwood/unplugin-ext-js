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
    parameters = {},
    returnDescription,
    filePath,
    fileName,
  } = metadata

  // --- Generate the `@param` tags.
  const parameterTags = Object.values(parameters)
    .map(({ name, description }) => ['@param', name, description].filter(Boolean).join(' ').trim())
    .join('\n')

  // --- Generate JSDoc.
  const comment = [
    description,
    defaultValue && defaultValue.length < 16 && `@default ${defaultValue}`,
    parameterTags,
    returnDescription && `@return ${returnDescription}`,
    since && `@since \`${since}\``,
    example && `@example\n${example}`,
    filePath ? `@see [${fileName}](${filePath})` : '',
  ]
    .filter(Boolean)
    .join('\n')
    .trim()
    .replace(/^_{4}/gm, '    ')
    .split('\n')
    .map(x => ` * ${x}`.trimEnd())
    .join('\n')

  // --- Return nothing if no comment.
  if (comment.length < 3) return ''

  return `/**\n${comment}\n */`
}
