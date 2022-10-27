import { MetadataObject } from '~/types'

/**
 * Generate an `Ext.create` overload.
 * @param MetadataObject The Ext JS class.
 * @returns The generated overload.
 */
export const buildDtsOverload = ({ name }: MetadataObject) =>
  `function create(className: '${name}', config?: ${name}, initializer?: (instance: ${name}) => void): ${name};`
