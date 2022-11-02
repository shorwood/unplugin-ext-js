import { tries } from '@hsjm/shared'
import { MetadataObject } from '~/types'

/**
 * Compute and apply the `extends` and `implements` properties of a class.
 * @param metadata The metadata to transform.
 * @returns The transformed metadata.
 */
export const preprocessClassInheritance = (metadata: MetadataObject) => {
  if (!metadata.properties) return metadata
  const { extend, mixins, ...properties } = metadata.properties

  // --- Extract the `"extend"` value.
  const extendsDefaultValue = extend?.defaultValue ?? '"Ext.Component"'
  const extendsClass = tries(
    () => JSON.parse(extendsDefaultValue),
    () => extendsDefaultValue.replace(/["']/g, ''),
  )

  // --- Extract the `"mixins"` values.
  const mixinsDefaultValue = mixins?.defaultValue ?? '[]'
  const mixinsClasses = tries(
    () => JSON.parse(mixinsDefaultValue),
    () => mixinsDefaultValue.replace(/["']/g, '').split(',').map(x => x.replace(/["']/g, '')),
  )

  // --- Return the transformed metadata.
  return {
    ...metadata,
    extend: extendsClass,
    mixins: mixinsClasses,
    properties,
  }
}
