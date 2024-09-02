import * as core from '@actions/core'
import { exec } from './exec'
import path from 'path'
import fs from 'fs/promises'
import { uploadPackageJS } from './upload'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const tag = await getPublishTag()
    core.debug(`publish tag is ${tag}`)
    const stdout = await exec(`pnpm publish -r --tag ${tag} --no-git-checks`)
    core.info(stdout)

    const cwd = process.cwd()
    const dirs = await fs.readdir(path.join(cwd, 'packages'))
    core.debug(`dirs: ${JSON.stringify(dirs)}`)
    await Promise.all(
      dirs.map(dir => uploadPackageJS(path.join(cwd, 'packages', dir)))
    )
  } catch (error) {
    core.error(JSON.stringify(error))
    core.setFailed(error)
  }
}

async function getPublishTag() {
  try {
    const pkg = JSON.parse(
      await fs.readFile(path.join(process.cwd(), 'package.json'), {
        encoding: 'utf-8'
      })
    )
    const version = pkg.version
    core.debug(`current version: ${version}`)
    if (!version) {
      return 'latest'
    }
    const match = version.match(/-(\w+)\./)
    if (match) {
      return match[1]
    } else {
      return 'latest'
    }
  } catch (e) {
    core.setFailed(e)
  }
}
