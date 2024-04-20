import {promises as fs} from 'node:fs'
import {exec as execCallback} from 'node:child_process'
import {promisify} from 'node:util'

const exec = promisify(execCallback)

async function incrementVersion(): Promise<void> {
  try {
    const packageJsonPath = './package.json'
    const packageJsonData = await fs.readFile(packageJsonPath, 'utf8')
    const packageJson = JSON.parse(packageJsonData)

    const versionParts = packageJson.version.split('.')
    const major = Number.parseInt(versionParts[0], 10)
    const minor = Number.parseInt(versionParts[1], 10) + 1
    const patch = Number.parseInt(versionParts[2], 10)

    const newVersion = `${major}.${minor}.${patch}`
    packageJson.version = newVersion

    await fs.writeFile(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2),
      'utf8',
    )

    await exec('git add package.json')
    await exec(`git commit -m "Bump version to ${newVersion}"`)
    await exec(`git tag v${newVersion}`)
    await exec('git push origin --tags')

    console.log(`Version updated to ${newVersion} and pushed to git.`)
  } catch (error) {
    console.error('Failed to increment version:', error)
  }
}

await incrementVersion()
