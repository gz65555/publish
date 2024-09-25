const { glob, globSync, globStream, globStreamSync, Glob } = require('glob')

glob('dist/**/*.js', { ignore: 'node_modules/**' }).then(jsfiles => {
  console.log(jsfiles)
})
