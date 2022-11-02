import { preprocessClassConfig } from './preprocessClassConfig'
import { preprocessClassStatics } from './preprocessClassStatics'
import { preprocessClassInheritance } from './preprocessClassInheritance'
import { preprocessNesting } from './preprocessNesting'
import { MetadataObject } from '~/types'

/**
 * Perform addional transformations on the metadata of an ExtJS Class.
 * @param metadata The metadata to transform.
 * @returns The transformed metadata.
 */
export const preprocessClass = (metadata: MetadataObject) => {
  // --- Transform the metadata.
  metadata = preprocessClassConfig(metadata)
  metadata = preprocessClassInheritance(metadata)
  metadata = preprocessClassStatics(metadata)
  metadata = preprocessNesting(metadata)

  // --- Return the transformed metadata.
  return metadata
}
