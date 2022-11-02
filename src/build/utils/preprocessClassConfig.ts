/* eslint-disable prefer-const */
import { capitalize } from '@hsjm/shared'
import { MetadataObject } from '~/types'

/**
 * Add getters and setters from config properties of a class.
 * @param metadata The metadata to transform.
 * @returns The transformed metadata.
 */
export const preprocessClassConfig = (metadata: MetadataObject) => {
  if (!metadata.properties) return metadata
  let { config, ...properties } = metadata.properties

  // --- Find all properties that have `isConfig: true`.
  for (const key in properties) {
    const value = properties[key]
    if (!value.isConfig) continue
    config = config ?? { name: 'config', kind: 'Object', properties: {} }
    config.properties = config.properties ?? {}
    config.properties[key] = value
  }

  // --- Extract config properties and generate their getters and setters.
  for (const key in config?.properties) {
    const value = config.properties[key]
    const getterKey = `get${capitalize(key)}`
    const setterKey = `set${capitalize(key)}`

    // --- Add the getter.
    properties[getterKey] = {
      name: getterKey,
      kind: 'Function',
      description: value.description,
      returnType: value.type,
      returnDescription: `The value of \`this.${key}\`.`,
    }

    // --- Add the setter.
    properties[setterKey] = {
      name: setterKey,
      kind: 'Function',
      description: `Sets the value of \`this.${key}\`.`,
      parameters: { [key]: value },
    }
  }

  // --- Return the transformed metadata.
  return {
    ...metadata,
    properties: { config, ...properties },
  }
}
