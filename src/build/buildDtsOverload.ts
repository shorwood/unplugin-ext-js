import { MetadataObject } from '~/types'

/**
 * Build a map of all class by name.
 * @param metadata The Ext JS classes.
 */
export const buildDtsOverload = (metadata: MetadataObject[]) => {
  const declarations = metadata.map(({ name }) => `  '${name}': ${name};`).join('\n')
  const declarationClassMap = `interface ExtClassMap {\n${declarations}\n}`

  const declarationInfer = `declare namespace Ext {
  type InferClass<T extends string> = T extends keyof ExtClassMap ? ExtClassMap[T] : never
  function create<T extends keyof ExtClassMap>(className: T, config?: ExtClassMap[T], initializer?: (instance: InferClass<T>) => void): InferClass<T>;
  function require<T extends string>(className: T, callback?: (instance: InferClass<T>) => void): InferClass<T>;
  function define<T extends keyof ExtClassMap>(className: string, config?: { extend: T } & Partial<ExtClassMap[T]> & Record<string, any>): void;
}`

  return [declarationClassMap, declarationInfer].filter(Boolean).join('\n\n')
}
