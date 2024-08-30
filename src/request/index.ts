import axios from 'axios'
import https from 'https'

// At request level
const agent = new https.Agent({
  rejectUnauthorized: false
})

export function uploadByPublicKey(form: FormData) {
  return axios.post(process.env['OASISBE_UPLOAD_URL'], form, {
    httpsAgent: agent,
    headers: JSON.parse(process.env['OASISBE_REQUEST_HEADER'])
  })
}
