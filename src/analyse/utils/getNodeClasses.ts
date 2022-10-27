import { ExpressionStatement, SourceFile, SyntaxKind } from 'ts-morph'

/**
 * Extract ExtJS classes metadata from a TypeScript source file.
 * @param sourceFile The source file to extract from.
 * @return The extracted classes metadata.
 */
export const getNodeClasses = (sourceFile: SourceFile): ExpressionStatement[] => {
  const classes = sourceFile
    .getDescendantsOfKind(SyntaxKind.ExpressionStatement)
    .filter((node) => {
      try {
        return node
          .getFirstChildByKindOrThrow(SyntaxKind.CallExpression)
          .getFirstChildByKindOrThrow(SyntaxKind.PropertyAccessExpression)
          .getText() === 'Ext.define'
      }

      // --- If no `Ext.define` found, return false.
      catch { return false }
    })

  return classes
}
