import { Node } from 'ts-morph'

/**
 * Log the tree structure of a node
 * @param node The TypeScript node to log.
 * @param depth The depth of the node in the tree.
 * @param maxDepth The maximum depth to log.
 * @returns The tree structure of the node.
 */
export const logTree = (node: Node, depth = 0, maxDepth = 10) => {
  // --- Recursion guard.
  if (!node) return
  if (depth > maxDepth) return

  // --- Check for module export status.
  // @ts-expect-error: `isExported` only exists on a few node types.
  const isExported = !!node.isExported?.()
  // @ts-expect-error: Same as above.
  const isFromExternalLibrary = !!node.isFromExternalLibrary?.()
  const isInNodeModules = false // ---node.isInNodeModules?.()
  if (isFromExternalLibrary || isInNodeModules) return

  // --- Build the output text.
  const indent = ' '.repeat(depth * 2)
  const kindName = node.getKindName()
  const text = node.getText().split('\n')[0]
  const value = isExported ? ' (exported)' : text
  const line = `${indent}[${depth}:${kindName}]: ${value}`
  const outputLines = [line]

  // --- Recurse.
  for (const child of node.getChildren()) {
    const tree = logTree(child, depth + 1, maxDepth)
    if (tree) outputLines.push(tree)
  }

  // --- Return the output.
  return outputLines.join('\n')
}
