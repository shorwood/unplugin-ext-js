import { writeFileSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { analyseFiles } from '../src/analyse'
import { buildDts } from '../src/build'

const classPaths = [
  'assets/ext-7.5.1/packages/core/src/**/*.js',
  'assets/ext-7.5.1/classic/classic/src/**/*.js',
  // 'assets/ext-7.5.1/**/Info.js',
]
const outDirectory = 'dist/classes'

export default async() => {
  const classes = await analyseFiles(classPaths)
  const absoluteOutDirectory = resolve(outDirectory)
  await mkdir(absoluteOutDirectory, { recursive: true })

  // const declarations = buildDts(classes)
  // const outPath = resolve(absoluteOutDirectory, 'Ext.d.ts')
  // writeFileSync(outPath, declarations)

  for (const metadata of classes) {
    const declaration = buildDts(metadata)
    const outPath = resolve(absoluteOutDirectory, `${metadata.name}.d.ts`)
    writeFileSync(outPath, declaration)
  }
}
