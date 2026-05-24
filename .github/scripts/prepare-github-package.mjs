import { readFileSync, writeFileSync } from 'node:fs'

const packagePath = new URL('../../package.json', import.meta.url)
const pkg = JSON.parse(readFileSync(packagePath, 'utf8'))

pkg.name = '@user-xxy/yhc-dev-react-hooks'
pkg.publishConfig = {
  registry: 'https://npm.pkg.github.com',
}

writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`)
