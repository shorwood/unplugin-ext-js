/**
 * Deeply applies a nesting structure to properties that include a `.` in their name.
 *
 * For example, the property `foo.bar` will be nested under the `foo.properties.bar` property.
 *
 * @param object The object to apply the nesting to.
 * @returns The transformed metadata.
 */
export const preprocessNesting = <T extends Record<string, any>>(object: T): T => {
  if (typeof object !== 'object') return object

  // --- Extract the properties that need to be nested.
  for (const key in object) {
    if (/^'.+'$/.test(key)) continue
    if (key.includes('...')) continue
    if (!key.includes('.')) continue

    // --- Get the path to the property.
    const value = object[key]
    if (typeof value !== 'object') continue
    const [parentKey, ...childKeys] = key.split('.')
    const childKey = childKeys.join('.')

    // --- Create the parent property if it doesn't exist.
    // @ts-expect-error: We're creating a new property.
    object[parentKey] = object[parentKey] ?? { name: parentKey }
    object[parentKey].properties = object[parentKey].properties ?? {}
    object[parentKey].properties[childKey] = { ...value, name: childKey }

    // --- Delete the original property.
    delete object[key]
  }

  // --- Recursively apply the nesting to the properties.
  for (const key in object) {
    if (key !== 'properties') continue
    object[key] = preprocessNesting(object[key])
  }

  // --- Return the transformed object.
  return object
}
