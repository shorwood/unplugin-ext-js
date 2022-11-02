import { Collection } from '@hsjm/shared'
import { buildDtsProperty } from './buildDtsProperty'
import { MetadataObject } from '~/types'

/**
 * Generates a TypeScript class declaration for an object property.
 * @param properties The metadata of the object properties.
 * @returns The generated TypeScript definition.
 */
export const buildDtsObject = (properties: Collection<MetadataObject>) => {
  // --- Map the properties to their TypeScript definitions.
  const type = Object.values(properties)
    .map(buildDtsProperty)
    .map(x => x.split('\n').map(x => `  ${x}`).join('\n'))
    .join('\n')

  // --- Generate the final declaration file.
  return `{\n${type}\n}`
}
