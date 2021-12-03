'use strict';

const request = require('got');
const ecosystem = require('config').get('ecosystem');

const ZIP_FILE = 'SD_ARTIFACT.zip';

class Store {
    constructor(buildId, token) {
        this.buildId = buildId;
        this.token = token;
        this.baseUrl = `${ecosystem.store}/v1`;
    }

    /**
     * Get zip artifact file
     * @method  getZipArtifact
     * @return  {Promise}         An zip object which contains artifacts
     */
    async getZipArtifact() {
        const options = {
            url: `${this.baseUrl}/builds/${this.buildId}/ARTIFACTS/${ZIP_FILE}`,
            method: 'GET',
            headers: {
                Authorization: this.token
            },
            retry: {
                limit: 5
            },
            responseType: 'buffer'
        };

        return request(options).catch(err => {
            throw new Error(err.response.body.toString());
        });
    }

    /**
     * Put unzipped artifact file
     * @method  putArtifact
     * @param  {String}  fileName   File name of the artifact which is to put to store
     * @param  {Buffer}  file       File body of the artifact which is to put to store
     * @return  {Promise}
     */
    async putArtifact(fileName, file) {
        const options = {
            url: `${this.baseUrl}/builds/${this.buildId}/ARTIFACTS/${fileName}`,
            method: 'PUT',
            headers: {
                Authorization: this.token,
                'Content-Type': 'text/plain'
            },
            retry: {
                limit: 5
            },
            body: file
        };

        return request(options).catch(err => {
            throw new Error(err.response.body.toString());
        });
    }
}

module.exports = Store;
