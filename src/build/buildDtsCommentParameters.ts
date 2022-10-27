import { MetadataObject } from '~/types'

/**
 * Generate JSDoc for a set of parameters.
 * @param parameters The parameters to generate JSDoc for.
 * @returns The generated JSDoc.
 */
export const buildDtsCommentParameters = (parameters: Record<string, MetadataObject>): string => {
  if (!parameters) return ''

  // --- Generate JSDoc for each parameter.
  return Object.values(parameters)
    .map((parameter) => {
      const { name, type, description, isOptional, defaultValue } = parameter
      let result = '@param'

      // --- Append the type.
      if (type) result += ` {${type}}`

      // --- Wrap the name in brackets if optional. Add the default value if any.
      if (defaultValue) result = `${result} [${name}=${defaultValue}]`
      else if (isOptional) result = `${result} [${name}]`
      else result = `${result} ${name}`

      // --- Append the description.
      if (description) result += ` ${description}`

      // --- Return the trimmed result.
      return result.trim()
    })
    .join('\n')
}
