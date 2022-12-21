// simple script to fetch libp2p-relay-daemon from IPFS

const os = require('os')
const cachedir = require('cachedir')
const fs = require('fs')
const path = require('path')
const Hash = require('ipfs-only-hash')
const uzStream = require('unzip-stream')
const gunzip = require('gunzip-maybe')
const tarFs = require('tar-fs')

const platform = {
    darwin: 'Qmc8rABHW9UBXiJ88DK9KH9pgJDZzADvWF8KxAPqTuoxeF',
    linux: 'QmSpRFtm2NWiqCkAeY13x2x5JSBX816HQxJnGLMQ2ZoqVe',
    win32: 'Qmd7NLNVaNK8RqvxE7AdosSCXWjBJDrm85eLirgJLFK5q7',
}

const downloadURL = platform[os.platform()] ? `https://ipfs.io/ipfs/${platform[os.platform()]}` : undefined

const fetchBinary = async () => {
    const got = await (await import('got')).default
    if (!downloadURL) {
        throw new Error(`No binary for platform ${os.platform()}`)
    }
    const filename = platform[os.platform()]
    const cache = cachedir('npm-libp2p-relay-daemon')
    const cachedFile = path.join(cache, filename)

    if (!fs.existsSync(cache)) {
        fs.mkdirSync(cache, { recursive: true })
    }

    if (!fs.existsSync(cachedFile)) {
        // Download file
        console.info(`Downloading relay daemon to ${cachedFile} (CID: ${filename})`)
        fs.writeFileSync(cachedFile, await got(downloadURL).buffer())
    } else {
        console.info(`Found relay daemon, (CID: ${filename})`)
    }

    console.info(`Verifying CID`)
    const reader = fs.readFileSync(cachedFile)
    // Is it possible to stream this file instead of reading it
    // all into a buffer
    const calculatedSHA = await Hash.of(reader)
    if (calculatedSHA !== filename) {
        throw new Error(`CID did not match: expected ${filename}, found ${calculatedSHA}`)
    }
    return cachedFile
}

/**
 * @param {string} cachedFile 
 */
const unpack = async (cachedFile) => {
    const stream = fs.createReadStream(cachedFile)
    const installPath = path.resolve(__dirname, '..', 'bin')
    await new Promise((resolve, reject) => {
        if (cachedFile.endsWith('.zip')) {
            const extract = uzStream.Extract({ path: installPath })
                .on('close', resolve)
                .on('error', reject)
            return stream.pipe(extract)
        }

        return stream.pipe(gunzip())
            .pipe(tarFs.extract(installPath).on('finish', resolve)
                .on('error', reject))
    })
    filename = `libp2p-relay-daemon${cachedFile.endsWith('.zip')? '.exe' : ''}`
    return path.join(installPath, 'libp2p-relay-daemon', filename)
}

module.exports = {
    fetchBinary,
    unpack,
}