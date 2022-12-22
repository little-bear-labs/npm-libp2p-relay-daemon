const { run } =  require('npm-libp2p-relay-daemon')
const os = require('os')
const path = require('path')

const configPath = 'config.json'
const identityPath = path.join(os.tmpdir(), `relayd_v2-${Math.random()}.identity`)

run(configPath, identityPath)