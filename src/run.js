const { fetchBinary, unpack } =  require("./download.js")
const fs = require('fs')
const os = require('os')
const path = require('path')

const RELAY_STARTUP_TIMEOUT = Number(process.env.RELAY_STARTUP_TIMEOUT || 30000)

const run = async (configPath, identityPath) => {
  const { execaCommand } = await import('execa')
  const { default: pTimeout } = await import('p-timeout')

  const binaryPath = await fetchBinary().then(unpack)
  identityPath = identityPath || path.join(os.tmpdir(), `relayd_v2-${Math.random()}.identity`)

  const relayd = execaCommand(`${binaryPath} -config ${configPath} -id ${identityPath}`, {
    all: true
  })

  const all = relayd.all

  if (all == null) {
    throw new Error('No stdout/stderr on execa return value')
  }

  const waitForStartup = async () => {
    let id = ''

    for await (const line of all) {
      const text = line.toString()

      console.log(text)

      if (text.includes(`RelayV2 is running!`)) {
        return id
      }

      if (text.includes('I am')) {
        id = text.split('I am')[1].split('\n')[0].trim()
      }
    }
  }

  const promise = waitForStartup()
  
  promise.cancel = () => {
    console.error(`Timed out waiting for ${binaryPath} to start after ${RELAY_STARTUP_TIMEOUT}ms, killing process`)
    relayd.kill()
  }

  const id = await pTimeout(promise, {
    milliseconds: RELAY_STARTUP_TIMEOUT
  })

  const config = JSON.parse(fs.readFileSync(configPath, {
    encoding: 'utf-8'
  }))

  const result = {
    relayd,
    api: {
      peerId: {
        id,
        addresses: [
          `${config.Network.ListenAddrs[0]}/p2p/${id}`
        ]
      },
      id: () => Promise.resolve({
        id,
        addresses: [
          `${config.Network.ListenAddrs[0]}/p2p/${id}`
        ]
      })
    }
  }
  
  return result
}

module.exports = { run }