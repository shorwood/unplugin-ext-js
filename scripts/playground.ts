import { writeFileSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { analyseFiles } from '../src/analyse'
import { buildDts } from '../src/build'

const outDirectory = 'dist'

export default async(className: string) => {
  // const classPaths = [
  //   `assets/ext-7.5.1/packages/core/src/**/${className}.js`,
  //   `assets/ext-7.5.1/classic/classic/src/**/${className}.js`,
  // ]

  const classes = await analyseFiles(className)
  const absoluteOutDirectory = resolve(outDirectory)
  await mkdir(absoluteOutDirectory, { recursive: true })

  const declarations = buildDts(classes)
  const outPath = resolve(absoluteOutDirectory, 'index.d.ts')
  const outJsonPath = resolve(absoluteOutDirectory, 'index.json')
  writeFileSync(outPath, declarations)
  writeFileSync(outJsonPath, JSON.stringify(classes, undefined, 2))

  // for (const metadata of classes) {
  //   const declaration = buildDts(metadata)
  //   const outPathDts = resolve(absoluteOutDirectory, `${metadata.name}.d.ts`)
  //   const outPathJson = resolve(absoluteOutDirectory, `${metadata.name}.json`)
  //   writeFileSync(outPathDts, declaration)
  //   writeFileSync(outPathJson, JSON.stringify(metadata, undefined, 2))
  // }
}
