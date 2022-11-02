import { MetadataObject } from '~/types'

/**
 * Set the `"isStatic"` property of all properties in the `"statics"` object.
 * @param metadata The metadata to transform.
 * @returns The transformed metadata.
 */
export const preprocessClassStatics = (metadata: MetadataObject) => {
  if (!metadata.properties)
    return metadata
  const { statics, inheritableStatics, ...properties } = metadata.properties

  // --- Extract statics and assign them to the class' properties.
  const allStatics = { ...statics?.properties, ...inheritableStatics?.properties }
  for (const key in allStatics) {
    allStatics[key].isStatic = false
    properties[key] = { ...allStatics[key], isStatic: true }
  }

  // --- Return the transformed metadata.
  return {
    ...metadata,
    properties: { statics, inheritableStatics, ...properties },
  }
}
