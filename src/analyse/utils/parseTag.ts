import { tries } from '@hsjm/shared'
import { JSDocTag, Node, SyntaxKind } from 'ts-morph'
import { getNodeType } from './getNodeType'

export interface ParseTagReturnType {
  /** The tag name. */
  tagName: string
  /** The variable name associated with the tag. */
  name?: string
  /** The type of the variable associated with the tag. */
  type?: string
  /** The description of the variable associated with the tag. */
  description?: string
  /** Whether the variable associated with the tag is optional. */
  isOptional?: boolean
  /** The default value of the variable associated with the tag. */
  defaultValue?: string
  /** The return type of the tag. */
  returnType?: string
  /** The return description of the tag. */
  returnDescription?: string
}

/**
 * Extract data from the `@cfg` tag of an ExtJS class property.
 * @param tag The tag to extract data from.
 * @returns The extracted data.
 */
export const parseTag = (tag: JSDocTag): ParseTagReturnType => {
  const text = tag.getCommentText()?.trim()
  const tagName = tag.getTagNameNode().getText()

  // --- Extract from a `@return` tag.
  if (Node.isJSDocReturnTag(tag)) {
    const returnType = getNodeType(tag)
    const returnDescription = text
    return { tagName, returnType, returnDescription }
  }

  // --- Extract from a `@param` tag.
  if (Node.isJSDocParameterTag(tag)) {
    const name = tries(
      () => tag.getLastChildByKindOrThrow(SyntaxKind.QualifiedName).getText(),
      () => tag.getLastChildByKindOrThrow(SyntaxKind.Identifier).getText(),
    )
    const description = text
    const type = getNodeType(tag)
    const isOptional = tag.isBracketed()
    const defaultValue = tag.getText().match(/(?<=\[[\w.]+=).*(?=])/)?.[0]
    return { tagName, name, type, description, isOptional, defaultValue }
  }

  // --- Extract from a `@type` tag.
  if (Node.isJSDocTypeTag(tag)) {
    const type = getNodeType(tag)
    const description = text
    return { tagName, type, description }
  }

  // --- Fallback to regular expression parsing.
  if (!text) return { tagName }
  const regexp = /({(?<type>.+)} +)?((?<name>[\w.]+)|(\[(?<nameOptional>[\w.]+)(=(?<defaultValue>[^\]]+?))?]))?(?:\s*(?<description>.*))?/
  const match = text.match(regexp)
  const groups = match?.groups
  if (!groups) return { tagName }

  // --- Compute and return the extracted data.
  return {
    tagName,
    name: groups.nameOptional || groups.name,
    type: groups.type,
    description: groups.description?.trim() || undefined,
    isOptional: !!groups.nameOptional,
    defaultValue: groups.defaultValue,
  }
}
