import path from 'path'
import { fileFromPath } from 'formdata-node/file-from-path'
import { uploadByPublicKey } from './request'
import crypto from 'crypto'
import fs from 'fs'
import * as core from '@actions/core'

const publicKey = process.env['OASISBE_PUBLIC_KEY']

export async function uploadPackageJS(dirPath: string) {
  const distPath = path.join(dirPath, 'dist')
  if (!fs.existsSync(distPath)) {
    core.debug(`${dirPath} does not exist, ignore release.`)
    return
  }
  const pkg = JSON.parse(
    fs.readFileSync(path.join(dirPath, 'package.json'), {
      encoding: 'utf-8'
    })
  )
  const version = pkg.version
  const files = fs.readdirSync(distPath)
  core.debug(`upload package: ${pkg.name}`)
  for (let i = 0; i < files.length; i++) {
    const filename = files[i]
    const filepath = path.join(distPath, filename)

    const res = await upload({
      filename,
      filepath,
      alias: `${pkg.name}/${version}/${filename}`
    })
    core.info(`uploaded: ${res.data}`)
  }
}

export async function upload({
  filename,
  alias,
  filepath
}: {
  filename: string
  alias: string
  filepath: string
}) {
  const form = new FormData()
  const message = 'upload'
  const signature = crypto.publicEncrypt(publicKey, Buffer.from(message))
  const file = await fileFromPath(filepath, 'index.txt')
  form.append('signature', signature.toString('base64'))
  form.append('filename', filename)
  form.append('alias', alias)
  form.append('file', file)

  const result = await uploadByPublicKey(form)
  return result.data
}
