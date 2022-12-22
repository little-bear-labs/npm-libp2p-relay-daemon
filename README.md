# NPM LibP2P Relay Daemon

This utility downloads and runs the [V2](https://github.com/libp2p/specs/blob/master/relay/circuit-v2.md) of the [libp2p relay daemon](https://github.com/libp2p/go-libp2p-relay-daemon).

## Usage

First, create a config.json file.  

```shell
touch config.json
```

An example of a config.json file:

```json
{
  "RelayV1": {
    "Enabled": false
  },
  "RelayV2": {
    "Enabled": true
  },
  "Network": {
    "ListenAddrs": ["/ip4/127.0.0.1/tcp/24222/ws"],
    "AnnounceAddrs": ["/ip4/127.0.0.1/tcp/24222/ws"]
  },
  "Daemon": {
    "PprofPort": -1
  }
}
```

Now let's run the libp2p relay deamon:

```js
const { run } =  require('npm-libp2p-relay-daemon')
const os = require('os')
const path = require('path')

const configPath = 'config.json'
const identityPath = path.join(os.tmpdir(), `relayd_v2-${Math.random()}.identity`)

run(configPath, identityPath)
```