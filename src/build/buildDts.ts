import { MaybeArray, arrayify, groupBy } from '@hsjm/shared'
import { buildDtsClass } from './buildDtsClass'
import { buildDtsOverload } from './buildDtsOverload'
import { MetadataObject } from '~/types'

/**
 * Generates a TypeScript declaration file for the Ext JS class.
 * @param classes The Ext JS classes metadata.
 * @returns The generated TypeScript declaration file.
 */
export const buildDts = (classes: MaybeArray<MetadataObject>): string => {
  classes = arrayify(classes)

  // --- Group the classes by their namespace.
  const namespaces = groupBy(classes, cls => cls.name.split('.').slice(0, -1).join('.') ?? '')

  // --- Generate the declarations for each namespace.
  const classDeclarations = Object.entries(namespaces)
    .map(([namespace, classes]) => {
      const declarations = classes.map(buildDtsClass)
        .map(x => x.split('\n').map(x => `  ${x}`).join('\n'))
        .join('\n')
      return `declare namespace ${namespace} {\n${declarations}\n}`
    })
    .join('\n\n')

  // --- Generate the overloads for the `Ext.create` function.
  const overloads = classes
    .map(buildDtsOverload)
    .join('\n')
    .split('\n')
    .map(x => `  ${x}`).join('\n')
  const overloadsDeclaration = `declare namespace Ext {\n${overloads}\n}`

  // --- Generate the final declaration file.
  return [classDeclarations, overloadsDeclaration].filter(Boolean).join('\n\n')
}
