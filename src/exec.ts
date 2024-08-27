import { exec as _exec } from 'child_process'

export async function exec(input: string, cwd: string = process.cwd()) {
  return new Promise<string>((resolve, reject) => {
    _exec(input, { cwd }, (error, stdout, stderr) => {
      if (!error) {
        resolve(stdout)
      } else {
        reject(stderr)
      }
    })
  })
}
