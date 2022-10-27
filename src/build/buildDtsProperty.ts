import { buildDtsComment } from './buildDtsComment'
import { MetadataObject } from '~/types'

/**
 * Generates a TypeScript interface property definition for the
 * property of an ExtJS Class.
 * @param property The property of an ExtJS Class.
 * @returns The generated TypeScript definition.
 */
export const buildDtsProperty = (property: MetadataObject) => {
  let { isOptional = false } = property
  const {
    name,
    kind,
    type = '',
    properties = {},
    parameters = {},
    returnType = 'void',
    defaultType,
    isStatic = false,
  } = property

  // --- Initialize the type set.
  const typeArray = type.split('|').map(x => x.trim()).filter(Boolean)
  const typeSet = new Set(typeArray)
  if (defaultType) typeSet.add(defaultType)

  // --- If the property is an object, generate it's definition.
  if (Object.keys(properties).length > 0) {
    const objectType = Object.values(properties)
      .map(buildDtsProperty)
      .map(x => x.split('\n').map(x => `  ${x}`).join('\n'))
      .join('\n')
    typeSet.add(`{\n${objectType}\n}`)
  }

  // --- Otherwise, if the property is a function, generate it's signature.
  else if (kind?.startsWith('Function')) {
    const functionParameters = Object
      .values(parameters)
      .filter(x => !x.name.includes('.'))
      .map((parameter) => {
        const { name, type, isOptional } = parameter
        return `${name}${isOptional ? '?' : ''}: ${type}`
      })
      .join(', ')
    typeSet.add(`(${functionParameters}) => ${returnType}`)
  }

  // --- Remove `null` or `undefined` from the type.
  if (typeSet.has('null') || typeSet.has('undefined')) {
    typeSet.delete('null')
    typeSet.delete('undefined')
    isOptional = true
  }

  // --- Compute keywords.
  const staticKeyword = isStatic ? 'static ' : ''
  const optionalKeyword = isOptional ? '?' : ''

  // --- Generate and return the declaration.
  const propertyType = [...typeSet].join(' | ') || 'unknown'
  const propertyDescription = buildDtsComment(property)
  const propertyDeclaration = `${staticKeyword}${name}${optionalKeyword}: ${propertyType}`
  return [propertyDescription, propertyDeclaration].filter(Boolean).join('\n')
}
