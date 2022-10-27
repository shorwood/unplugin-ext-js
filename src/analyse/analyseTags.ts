import { mergeDeep } from '@hsjm/shared'
import { JSDoc, JSDocTag, Node } from 'ts-morph'
import { parseTag } from './utils'
import { MetadataObject } from '~/types'

/**
 * Extract data from an ExtJS `JSDocTag` node.
 * @param tag The tag to extract data from.
 * @returns The extracted data.
 */
export const analyseTag = (tag: JSDocTag): Partial<MetadataObject> => {
  const { tagName, name, ...tagData } = parseTag(tag)

  // --- Extract miscellaneous tags.
  if (tagName === 'since') return { since: tagData.description }
  if (tagName === 'static') return { isStatic: true }
  if (tagName === 'private') return { isPrivate: true }
  if (tagName === 'protected') return { isProtected: true }
  if (tagName === 'event') return { name, kind: 'Function' }
  if (tagName === 'method') return { name, kind: 'Function' }

  // --- Extract `@return` tags.
  if (Node.isJSDocReturnTag(tag)) return tagData

  // --- Extract property/params definitions.
  // --- At this point, we need a name.
  if (!name) return {}
  if (['cfg', 'property'].includes(tagName)) return { name, ...tagData }
  if (Node.isJSDocParameterTag(tag)) return { parameters: { [name]: { name, ...tagData } } }

  // --- Fallback to empty object.
  return {}
}

/**
 * Extract data from an ExtJS `JSDoc` node.
 * @param node The `JSDoc` node to extract data from.
 * @returns The extracted data.
 */
export const analyseTags = (node: JSDoc): Partial<MetadataObject> => {
  const tags = node.getTags()
  const data = tags.map(analyseTag)
  const metadata = mergeDeep(...data)

  return metadata
}
