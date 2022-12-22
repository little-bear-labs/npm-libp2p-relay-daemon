const { fetchBinary, unpack } =  require("./download.js")
const { run } =  require("./run.js")

module.exports = {
    path: async () => fetchBinary().then(unpack),
    run,
}