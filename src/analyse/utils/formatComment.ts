/**
 * Convert a `@link` tag to a markdown link.
 * @param _match The match.
 * @param capture The captured text.
 * @returns The markdown link.
 */
const formatCommentLink = (_match: string, capture: string) => {
  const [link, text] = capture.split(' ')
  const url = `https://docs.sencha.com/extjs/7.5.1/classic/${link}.html`
  const linkText = text || link
  return `[${linkText}](${url})`
}

/**
 * Parse an Ext JS parameter type and standardize it.
 * @param type The type to parse.
 * @returns The parsed types.
 */
export const formatTypeText = (type: string): string => type
  ?.replace(/[{}]/g, '')
  .replace(/[/\\|]/g, ' | ')
  .replace(/Array<(.+)>/g, '$1[]')
  .replace(/Array/g, 'unknown[]')
  .replace(/String/g, 'string')
  .replace(/Number/g, 'number')
  .replace(/Boolean/g, 'boolean')
  .replace(/Object/g, 'Record<string, unknown>')
  .replace(/\.{3}/g, '')

// /**
//  * Transform an ExtJS code block into a JavaScript code block.
//  * @param code The code to transform.
//  * @returns The transformed code.
//  */
// export const formatCodeBlock = (code: string): string => {
//   const leftPaddingLength = code.indexOf('*')
//   const leftPadding = code.slice(0, Math.max(0, leftPaddingLength))
//   const codeLines = code
//     .split('\n')
//     .map(x => x.slice(leftPaddingLength + 5))
//     .join('\n')
//     .trim()
//   const codeBlock = ['```js', codeLines, '```', ''].join('\n')
//   return prependEachLines(codeBlock, leftPadding)
// }

/**
 * Format a JSDoc comment from ExtJS to TypeScript.
 * @param content The comment to format.
 * @returns The formatted comment.
 */
export const formatComment = (content: string): string => (
  content
    // --- Standardize the tags.
    .replace(/(?<=@\w+\s+{)(.+?)(?=})/g, formatTypeText)
    // .replace(/(^ *?\*)( +)(@\w+)/gm, '$1 $3')
    // .replace(/@cfg/g, '@param')
    // .replace(/@property/g, '@param')

    // --- Replace `@link` tags with markdown links.
    .replace(/{@link (.+?)}/g, formatCommentLink)

  // --- Preserve code blocks.
  // .replace(/(^ *\* {5}.+$[\S\s](?:^ *\*$[\S\s])?)+/gm, formatCodeBlock)
    .replace(/^ *\* {5}/gm, ' * ____')
    .replace(/<code>(.+?)<\/code>/g, '`$1`')
    .replace(/\* #{4}([^\n]+)/g, '* ### $1')

    // --- Convert 4 spaces to 2 spaces.
    .trim()
)
