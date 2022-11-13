import { buildDtsComment } from './buildDtsComment'
import { buildDtsObject } from './buildDtsObject'
import { MetadataObject } from '~/types'

/**
 * Generates a TypeScript interface property definition for the
 * property of an ExtJS Class.
 * @param property The property of an ExtJS Class.
 * @returns The generated TypeScript definition.
 */
export const buildDtsProperty = (property: MetadataObject) => {
  let { isOptional, isPrivate, isStatic } = property
  const {
    name,
    kind,
    type = '',
    properties = {},
    parameters = {},
    returnType = 'void',
    defaultType,
  } = property

  // --- Initialize the type set.

  const typeArray = type.split('|').map(x => x.trim()).filter(Boolean)
  let typeSet = new Set(typeArray)
  if (defaultType) typeSet.add(defaultType)

  // --- If the property is an object, generate it's definition.
  if (Object.keys(properties).length > 0) {
    const objectType = buildDtsObject(properties)
    typeSet.add(objectType)
    typeSet.delete('Record<string, unknown>')
  }

  // --- Otherwise, if the property is a function, generate it's signature.
  else if (kind?.startsWith('Function')
    || kind?.startsWith('ArrowFunction')
    || kind?.startsWith('Method')) {
    const functionParameters = Object
      .values(parameters)
      .map((parameter) => {
        // eslint-disable-next-line prefer-const
        let { name, type, isOptional, properties } = parameter
        if (properties) type = buildDtsObject(properties)
        return `${name}${isOptional ? '?' : ''}: ${type}`
      })
      .join(', ')
    typeSet.add(`(${functionParameters}) => ${returnType}`)
  }

  // --- Make sure only class properties have no keywords.
  else if (kind === 'Class') {
    isPrivate = false
    isStatic = false
  }

  // --- Remove `null` or `undefined` from the type.
  if (typeSet.has('null') || typeSet.has('undefined')) isOptional = true
  typeSet.delete('any')
  typeSet.delete('null')
  typeSet.delete('undefined')

  // --- Wrap arrow function if there are multiple types.
  if (typeSet.size > 1) typeSet = new Set([...typeSet].map(x => (x.includes('=>') ? `(${x})` : x)))

  // --- Compute keywords.
  const privateKeyword = isPrivate ? 'private ' : ''
  const staticKeyword = isStatic ? 'static ' : ''
  const optionalToken = isOptional ? '?' : ''
  const keywords = [privateKeyword, staticKeyword].filter(Boolean).join('')

  // --- Generate and return the declaration.
  const propertyType = [...typeSet].join(' | ') || 'unknown'
  const propertyDescription = buildDtsComment(property)
  const propertyDeclaration = `${keywords}${name}${optionalToken}: ${propertyType}`
  return [propertyDescription, propertyDeclaration].filter(Boolean).join('\n')
}
