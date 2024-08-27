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

    core.debug(`branches map: ${map}`)

    const branch = (await exec(`git branch --show-current`)).trim()

    core.debug(`current branch: ${branch}`)

    const keys = Object.keys(map)
    const result = micromatch([branch], keys)
    if (result.length > 0) {
      const tag = map[result[0]]
      try {
        await exec(`pnpm publish -r --tag ${tag} --no-git-checks`)
      } catch (error) {
        console.error('执行命令时出错:', error.message)
        throw error.output[1].toString()
      }
    } else {
      core.notice(`no match for the ${branch} branch, stop release`)
    }
  } catch (error) {
    core.debug(`error: ${typeof error}`)
    core.setFailed(error)
  }
}
