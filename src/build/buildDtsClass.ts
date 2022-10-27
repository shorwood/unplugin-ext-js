import { buildDtsComment } from './buildDtsComment'
import { buildDtsProperty } from './buildDtsProperty'
import { MetadataObject } from '~/types'

/**
 * Generates a TypeScript class declaration for the Ext JS class.
 * @param MetadataObject The Ext JS class.
 * @returns The generated TypeScript definition.
 */
export const buildDtsClass = (MetadataObject: MetadataObject) => {
  const { name, properties = {}, inherits = [] } = MetadataObject
  const propertyBlacklist = new Set([
    'extend',
    'mixins',
    'statics',
    'inheritableStatics',
    'constructor',
  ])

  // --- Generate the properties declaration.
  const props = Object.values(properties)
    .filter(property => !!property?.name)
    .filter(property => !propertyBlacklist.has(property.name))
    .map(buildDtsProperty)
    .map(x => x.split('\n').map(x => `  ${x}`).join('\n'))
    .join('\n')

  const className = name.split('.').pop()
  const classExtends = inherits.length > 0
    ? ` extends (${inherits.join(', ')})`
    : ''

  const classDescription = buildDtsComment(MetadataObject)
  const classDeclaration = `export declare class ${className}${classExtends} {\n${props}\n}`
  return [classDescription, classDeclaration].filter(Boolean).join('\n')
}
