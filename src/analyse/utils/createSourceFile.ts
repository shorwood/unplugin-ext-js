import { Project, SourceFile } from 'ts-morph'

/**
 * Create a source file node.
 * @param syntax The syntax of the tag.
 * @returns The created source file.
 */
export const createSourceFile = (syntax: string): SourceFile =>
  new Project({ useInMemoryFileSystem: true })
    .createSourceFile('tmp', syntax)
