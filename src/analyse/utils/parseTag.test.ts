import { expect, it } from 'vitest'
import { JSDocTag, SyntaxKind } from 'ts-morph'
import { parseTag } from './parseTag'
import { createSourceFile } from './createSourceFile'

it.each([
  // --- Extract from a `@return` tag.
  ['@return {string} The description.', { tagName: 'return', returnType: 'string', returnDescription: 'The description.' }],
  ['@return The description.', { tagName: 'return', returnDescription: 'The description.' }],
  ['@return', { tagName: 'return' }],

  // --- Extract from a `@param` tag.
  ['@param {string} [name=defaultValue] The description.', { tagName: 'param', name: 'name', type: 'string', description: 'The description.', isOptional: true, defaultValue: 'defaultValue' }],
  ['@param {string} [name=undefined] The description.', { tagName: 'param', name: 'name', type: 'string', description: 'The description.', isOptional: true, defaultValue: 'undefined' }],
  ['@param {string} [name=defaultValue]', { tagName: 'param', name: 'name', type: 'string', isOptional: true, defaultValue: 'defaultValue' }],
  ['@param {string} [name=] The description.', { tagName: 'param', name: 'name', type: 'string', description: 'The description.', isOptional: true, defaultValue: '' }],
  ['@param {string} [name=]', { tagName: 'param', name: 'name', type: 'string', isOptional: true, defaultValue: '' }],
  ['@param {string} [name] The description.', { tagName: 'param', name: 'name', type: 'string', description: 'The description.', isOptional: true }],
  ['@param {string} name The description.', { tagName: 'param', name: 'name', type: 'string', description: 'The description.' }],
  ['@param name The description.', { tagName: 'param', name: 'name', description: 'The description.' }],
  ['@param name', { tagName: 'param', name: 'name' }],

  // --- Extract from a `@param` tag with a name that contains a dot.
  ['@param {string} [name.with.dot=defaultValue] The description.', { tagName: 'param', name: 'name.with.dot', type: 'string', description: 'The description.', isOptional: true, defaultValue: 'defaultValue' }],
  ['@param {string} [name.with.dot=undefined] The description.', { tagName: 'param', name: 'name.with.dot', type: 'string', description: 'The description.', isOptional: true, defaultValue: 'undefined' }],
  ['@param {string} [name.with.dot=defaultValue]', { tagName: 'param', name: 'name.with.dot', type: 'string', isOptional: true, defaultValue: 'defaultValue' }],
  ['@param {string} [name.with.dot=] The description.', { tagName: 'param', name: 'name.with.dot', type: 'string', description: 'The description.', isOptional: true, defaultValue: '' }],
  ['@param {string} [name.with.dot=]', { tagName: 'param', name: 'name.with.dot', type: 'string', isOptional: true, defaultValue: '' }],
  ['@param {string} [name.with.dot] The description.', { tagName: 'param', name: 'name.with.dot', type: 'string', description: 'The description.', isOptional: true }],
  ['@param {string} name.with.dot The description.', { tagName: 'param', name: 'name.with.dot', type: 'string', description: 'The description.' }],
  ['@param name.with.dot The description.', { tagName: 'param', name: 'name.with.dot', description: 'The description.' }],
  ['@param name.with.dot', { tagName: 'param', name: 'name.with.dot' }],

  // --- Extract from a `@type` tag.
  ['@type {string} The description.', { tagName: 'type', type: 'string', description: 'The description.' }],
  ['@type {string}', { tagName: 'type', type: 'string' }],
  ['@type', { tagName: 'type' }],

  // --- Extract from unknown tag.
  ['@tag {String} [name="true"] The name of the component.', { name: 'name', type: 'String', description: 'The name of the component.', isOptional: true, defaultValue: '"true"' }],
  ['@tag {String} [name] The name of the component.', { name: 'name', type: 'String', description: 'The name of the component.', isOptional: true, defaultValue: undefined }],
  ['@tag {String} name The name of the component.', { name: 'name', type: 'String', description: 'The name of the component.', isOptional: false, defaultValue: undefined }],
  ['@tag [name="true"] The name of the component.', { name: 'name', type: undefined, description: 'The name of the component.', isOptional: true, defaultValue: '"true"' }],
  ['@tag [name] The name of the component.', { name: 'name', type: undefined, description: 'The name of the component.', isOptional: true, defaultValue: undefined }],
  ['@tag name The name of the component.', { name: 'name', type: undefined, description: 'The name of the component.', isOptional: false, defaultValue: undefined }],
  ['@tag {String} [name="true"]', { name: 'name', type: 'String', description: undefined, isOptional: true, defaultValue: '"true"' }],
  ['@tag {String} [name]', { name: 'name', type: 'String', description: undefined, isOptional: true, defaultValue: undefined }],
  ['@tag {String} name', { name: 'name', type: 'String', description: undefined, isOptional: false, defaultValue: undefined }],
  ['@tag [name="true"]', { name: 'name', type: undefined, description: undefined, isOptional: true, defaultValue: '"true"' }],
  ['@tag [name]', { name: 'name', type: undefined, description: undefined, isOptional: true, defaultValue: undefined }],
  ['@tag name', { name: 'name', type: undefined, description: undefined, isOptional: false, defaultValue: undefined }],
  ['@tag {String} name="true" The name of the component.', { name: 'name', type: 'String', description: '="true" The name of the component.', isOptional: false, defaultValue: undefined }],
  ['@tag', {}],

])('should extract data from "%s"', (syntax, expected) => {
  // --- Create the tag node.
  const tag = createSourceFile(`/** ${syntax} */`)
    .getFirstDescendantByKindOrThrow(SyntaxKind.JSDoc)
    .getFirstChildOrThrow() as JSDocTag

  // --- Parse the tag.
  const result = parseTag(tag)

  // --- Check the result.
  for (const key of Object.keys(expected))
    // @ts-expect-error: Ignore.
    expect(result[key], `result.${key}`).toBe(expected[key])
})
