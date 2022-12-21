const { fetchBinary, unpack } =  require("./download.js")

module.exports = {
    path: async () => fetchBinary().then(unpack),
}