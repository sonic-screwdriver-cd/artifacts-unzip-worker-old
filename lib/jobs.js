const RETRY_LIMIT = 3;
// This is in milliseconds, reference: https://github.com/taskrabbit/node-resque/blob/master/lib/plugins/Retry.js#L12
const RETRY_DELAY = 5 * 1000;

const retryOptions = {
    retryLimit: RETRY_LIMIT,
    retryDelay: RETRY_DELAY
};

/**
 * Unzip ZIP artifacts and re-uploads the extracted artifacts to Store
 * @method unzip
 * @param  {Object}   config           Configuration object
 * @param  {Integer}  config.buildId   The ID of build that owned the artifacts
 * @param  {String}   config.token     The token to upload the extracted artifacts
 * @return {Promise}
 */
async function unzip(config) {
  console.log('unzip!', config);
  return;
}

module.exports = {
    unzip: {
        plugins: ['Retry'],
        pluginOptions: {
            Retry: retryOptions
        },
        perform: unzip
    }
};
