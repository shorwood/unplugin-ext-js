
export interface MetadataObject {
  /** The name of the property. */
  name: string
  /** The kind of the property. */
  kind?: string
  /** The type of the property. */
  type?: string
  /** The description of the property. */
  description?: string
  /** The default type of the property. */
  defaultType?: string
  /** The default value of the property. */
  defaultValue?: string
  /** The return type of the property. */
  returnType?: string
  /** The return description of the property. */
  returnDescription?: string
  /** The version of ExtJS when the property was added. */
  since?: string
  /** An example of the property. */
  example?: string
  /** Whether the property is optional. */
  isOptional?: boolean
  /** Whether the property is static. */
  isStatic?: boolean
  /** Whether the property is private. */
  isPrivate?: boolean
  /** Whether the property is protected. */
  isProtected?: boolean
  /** Whether the property is a `config` property. */
  isConfig?: boolean
  /** The properties defined in the property. */
  properties?: Record<string, MetadataObject>
  /** The parameters defined in the property. */
  parameters?: Record<string, MetadataObject>
  /** The name of the class the property extends. */
  extend?: string
  /** The names of the classes the property mixes in. */
  mixins?: string[]
}

export interface Metadata {
  /** The files to extract metadata from. */
  classes: Record<string, MetadataObject>
}
