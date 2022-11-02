import { buildDtsComment } from './buildDtsComment'
import { buildDtsProperty } from './buildDtsProperty'
import { preprocessClass } from './utils'
import { MetadataObject } from '~/types'

/**
 * Generates a TypeScript class declaration for the Ext JS class.
 * @param metadata The Ext JS class.
 * @returns The generated TypeScript definition.
 */
export const buildDtsClass = (metadata: MetadataObject) => {
  const { name, properties = {}, extend, mixins } = preprocessClass(metadata)
  const propertyBlacklist = new Set(['requires', 'constructor'])

  // --- Generate the properties declaration.
  const props = Object.values(properties)
    .filter(property => !!property?.name)
    .filter(property => !propertyBlacklist.has(property.name))
    .map(buildDtsProperty)
    .map(x => x.split('\n').map(x => `  ${x}`).join('\n'))
    .join('\n')

  const className = name.split('.').pop()
  const classExtends = extend ? ` extends ${extend}` : ''
  const classMixins = mixins?.length ? ` implements ${mixins.join(', ')}` : ''

  const classDescription = buildDtsComment(metadata)
  const classDeclaration = `class ${className}${classExtends}${classMixins} {\n${props}\n}`
  return [classDescription, classDeclaration].filter(Boolean).join('\n')
}
