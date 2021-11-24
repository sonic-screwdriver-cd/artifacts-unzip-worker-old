'use strict';

const mockery = require('mockery');
const sinon = require('sinon');

const unzipConfig = {
    buildId: 1234,
    token: 'dummytoken'
};

describe('Jobs Unit Test', () => {
    let jobs;
    let mockRequest;

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });
    });

    beforeEach(() => {
        mockRequest = sinon.stub();

        mockery.registerMock('screwdriver-request', mockRequest);

        // eslint-disable-next-line global-require
        jobs = require('../../lib/jobs');
    });

    describe('unzip', () => {
        it('can download artifacts ZIP from Store and re-upload the extracted artifacts to Store', () => {
            jobs.unzip.perform(unzipConfig);
        });
    });
});
