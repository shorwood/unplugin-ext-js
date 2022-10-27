import { readFile } from 'node:fs/promises'
import { MaybeArray } from '@hsjm/shared'
import { Project } from 'ts-morph'
import { sync as glob } from 'fast-glob'
import { analyseClass } from './analyseClass'
import { formatComment, getNodeClasses } from './utils'
import { MetadataObject } from '~/types'

/**
 * Extract Ext JS classes from file(s)
 * @param paths The file(s) to extract classes from. Accepts glob patterns.
 * @return The extracted TypeScript definitions.
 */
export const analyseFiles = async(paths: MaybeArray<string>): Promise<MetadataObject[]> => {
  // --- Bootstrap the TS Morph project.
  const project = new Project({ useInMemoryFileSystem: true })
  const filePaths = glob(paths, { absolute: true, onlyFiles: true })
  if (filePaths.length === 0) throw new Error('No files found')

  // --- Add the files to the project.
  const sourceFiles = await Promise.all(filePaths.map(async(filePath) => {
    const fileContent = await readFile(filePath, 'utf8')
    const fileContentTransformed = formatComment(fileContent)
    return project.createSourceFile(filePath, fileContentTransformed)
  }))

  // --- Find all component classes and extract their metadata.
  const classNodes = sourceFiles.flatMap(getNodeClasses)
  return classNodes.map(analyseClass)
}
