const { uploadPackageJS, upload } = require('./dist/index')
const path = require('path')

uploadPackageJS(process.cwd())
  .then(res => console.log(res))
  .catch(err => console.log(err))

// upload({
//   filename: 'index.js',
//   alias: '1.2.10/192.js',
//   filepath: path.join(process.cwd(), 'dist','index.js')
// })
