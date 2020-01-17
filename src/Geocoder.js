const NodeGeocoder = require("node-geocoder");
const Storage = require("node-storage");

/**
 * @class Geocoder
 * @classdesc A geocoder with caching
 */
class Geocoder {
  /**
   * @constructs Geocoder
   * @param {string} key - api key
   * @param {string} [cacheFile=.geo-cache] - permanent cache file
   */
  constructor(key, cacheFile = ".geo-cache") {
    this.cache = new Storage(cacheFile);
    this.api = NodeGeocoder({
      provider: "mapquest",
      httpAdapter: "https",
      apiKey: process.env.GEO_API_KEY,
      formatter: null
    });
  }

  /**
   * Get an endpoint, use cache if valid
   *
   * @param {string} address - address to look up
   * @returns {Promise} - resolves data or rejects error
   */
  get(address) {
    if (this.cache.get(address)) {
      return Promise.resolve(this.cache.get(address));
    } else {
      // console.log("get new: " + address);
      return this.api
        .geocode(address)
        .then(res => {
          // console.log(res)
          this.cache.put(address, [res[0].latitude, res[0].longitude]);
          return [res[0].latitude, res[0].longitude];
        })
        .catch(err => {
          throw new Error(err);
        });
    }
  }
}

module.exports = Geocoder;
