'use strict';

const assert = require('assert');
const mockery = require('mockery');
const sinon = require('sinon');
const AdmZip = require('adm-zip');

const ecosystemConfig = {
    store: 'https://test-store.screwdriver.cd'
};
const unzipConfig = {
    buildId: 1234,
    token: 'dummytoken'
};

describe('Jobs Unit Test', () => {
    let jobs;
    let mockConfig;
    let mockRequest;

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });
    });

    beforeEach(() => {
        mockRequest = sinon.stub();
        mockConfig = {
            get: sinon.stub()
        };

        mockery.registerMock('config', mockConfig);
        mockery.registerMock('store', mockRequest);

        mockConfig.get.withArgs('ecosystem').returns(ecosystemConfig);

        // eslint-disable-next-line global-require
        jobs = require('../../lib/jobs');
    });

    afterEach(() => {
        mockery.deregisterAll();
        mockery.resetCache();
    });

    after(() => {
        mockery.disable();
    });

    describe('unzip', () => {
        it('can download artifacts ZIP from Store and re-upload the extracted artifacts to Store', async () => {
            const testZip = new AdmZip();

            testZip.addFile('test-artifact1.txt', Buffer.from('test artifact 1'));
            testZip.addFile('test-artifact2.txt', Buffer.from('test artifact 2'));

            mockRequest
                .withArgs({
                    url: 'https://test-store.screwdriver.cd/v1/builds/1234/ARTIFACTS/SD_ARTIFACT.zip',
                    method: 'GET',
                    headers: {
                        Authorization: 'Bearer dummytoken'
                    },
                    responseType: 'buffer'
                })
                .resolves({ body: testZip.toBuffer() });
            mockRequest
                .withArgs({
                    url: 'https://test-store.screwdriver.cd/v1/builds/1234/ARTIFACTS/test-artifact1.txt',
                    method: 'PUT',
                    headers: {
                        Authorization: 'Bearer dummytoken',
                        'Content-Type': 'text/plain'
                    },
                    body: Buffer.from('test artifact 1')
                })
                .resolves({ statusCode: 202 });
            mockRequest
                .withArgs({
                    url: 'https://test-store.screwdriver.cd/v1/builds/1234/ARTIFACTS/test-artifact2.txt',
                    method: 'PUT',
                    headers: {
                        Authorization: 'Bearer dummytoken',
                        'Content-Type': 'text/plain'
                    },
                    body: Buffer.from('test artifact 2')
                })
                .resolves({ statusCode: 202 });

            assert.equal(await jobs.unzip.perform(unzipConfig), null);
        });

        it('raises an error when it failed to get ZIP artifacts', async () => {
            mockRequest
                .withArgs({
                    url: 'https://test-store.screwdriver.cd/v1/builds/1234/ARTIFACTS/SD_ARTIFACT.zip',
                    method: 'GET',
                    headers: {
                        Authorization: 'Bearer dummytoken'
                    },
                    responseType: 'buffer'
                })
                .throws('failed to get ZIP artifacts from Store');

            try {
                await jobs.unzip.perform(unzipConfig);
                assert.fail('Never reaches here');
            } catch (err) {
                assert.equal(err.message, 'failed to get ZIP artifacts from Store');
            }
        });

        it('raises an error when it failed to get ZIP artifacts', async () => {
            const testZip = new AdmZip();

            testZip.addFile('test-artifact1.txt', Buffer.from('test artifact 1'));
            testZip.addFile('test-artifact2.txt', Buffer.from('test artifact 2'));

            mockRequest
                .withArgs({
                    url: 'https://test-store.screwdriver.cd/v1/builds/1234/ARTIFACTS/SD_ARTIFACT.zip',
                    method: 'GET',
                    headers: {
                        Authorization: 'Bearer dummytoken'
                    },
                    responseType: 'buffer'
                })
                .resolves({ body: testZip.toBuffer() });
            mockRequest
                .withArgs({
                    url: 'https://test-store.screwdriver.cd/v1/builds/1234/ARTIFACTS/test-artifact1.txt',
                    method: 'PUT',
                    headers: {
                        Authorization: 'Bearer dummytoken',
                        'Content-Type': 'text/plain'
                    },
                    body: Buffer.from('test artifact 1')
                })
                .throws('failed to put an artifact to Store');

            try {
                await jobs.unzip.perform(unzipConfig);
                assert.fail('Never reaches here');
            } catch (err) {
                assert.equal(err.message, 'failed to put an artifact to Store');
            }
        });
    });
});
