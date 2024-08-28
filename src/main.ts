import * as core from '@actions/core'
import { exec } from './exec'
import micromatch from 'micromatch'

const defaultMap: Record<string, string> = {
  main: 'latest',
  'dev/*': 'beta',
  '[0-9]+.[0-9]+': 'latest'
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const branches = core.getInput('branches')

    core.debug(`branches: ${branches}`)

    const map = branches ? JSON.parse(branches) : defaultMap

    core.debug(`branches map: ${JSON.stringify(map)}`)

    const tag = await getPublishTag(map)

    core.debug(`publish tag is ${tag}`)
    try {
      const stdout = await exec(`pnpm publish -r --tag ${tag} --no-git-checks`)
      core.info(stdout)
    } catch (error) {
      console.error('执行命令时出错:', error.message)
      throw error.output[1].toString()
    }
  } catch (error) {
    core.debug(`error: ${typeof error}`)
    core.setFailed(error)
  }
}

async function getPublishTag(map: Record<string, string>) {
  core.debug(`branches map: ${JSON.stringify(map)}`)
  // default is latest
  const branch = (await exec(`git branch --show-current`)).trim()

  if (branch.length < 0) {
    // tag branch
    const version = (await exec(`git branch --show-current`)).trim()
    if (!version) {
      return 'latest'
    }
    const match = version.match(/-(\w+)\./)
    if (match) {
      return match[1]
    } else {
      return 'latest'
    }
  } else {
    const keys = Object.keys(map)
    const result = micromatch([branch], keys)
    core.debug(`matched ${JSON.stringify(result)}`)
    return map[result[0]]
  }
}
