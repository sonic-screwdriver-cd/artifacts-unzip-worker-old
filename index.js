'use strict';

const NodeResque = require('node-resque');
const config = require('config');
const logger = require('screwdriver-logger');
const jobs = require('./lib/jobs');
const { connectionDetails, queuePrefix } = require('./config/redis');
const workerConfig = config.get('worker');

const multiWorker = new NodeResque.MultiWorker(
    {
        connection: connectionDetails,
        queues: [`${queuePrefix}unzip`],
        minTaskProcessors: workerConfig.minTaskProcessors,
        maxTaskProcessors: workerConfig.maxTaskProcessors,
        checkTimeout: workerConfig.checkTimeout,
        maxEventLoopDelay: workerConfig.maxEventLoopDelay
    },
    jobs
);

// normal worker emitters
multiWorker.on('start', (workerId) => {
    logger.info(`worker[${workerId}] started`);
});
multiWorker.on('end', (workerId) => {
    logger.info(`worker[${workerId}] ended`);
});
multiWorker.on('cleaning_worker', (workerId, worker) => {
    logger.info(`cleaning old worker ${worker}`);
});
multiWorker.on('poll', (workerId, queue) => {
    logger.info(`worker[${workerId}] polling ${queue}`);
});
multiWorker.on('ping', (workerId, time) => {
    logger.info(`worker[${workerId}] check in @ ${time}`);
});
multiWorker.on('job', (workerId, queue, job) => {
    logger.info(`worker[${workerId}] working job ${queue} ${JSON.stringify(job)}`);
});
multiWorker.on('reEnqueue', (workerId, queue, job, plugin) => {
    logger.info(`worker[${workerId}] reEnqueue job (${plugin}) ${queue} ${JSON.stringify(job)}`);
});
multiWorker.on('success', (workerId, queue, job, result) => {
    logger.info(`worker[${workerId}] job success ${queue} ${JSON.stringify(job)} >> ${result}`);
});
multiWorker.on('failure', (workerId, queue, job, failure) => {
    logger.info(`worker[${workerId}] job failure ${queue} ${JSON.stringify(job)} >> ${failure}`);
});
multiWorker.on('error', (workerId, queue, job, error) => {
    logger.info(`worker[${workerId}] error ${queue} ${JSON.stringify(job)} >> ${error}`);
});
multiWorker.on('pause', (workerId) => {
    logger.info(`worker[${workerId}] paused`);
});

// multiWorker emitters
multiWorker.on('internalError', (error) => {
    logger.info(error);
});
multiWorker.on('multiWorkerAction', (verb, delay) => {
    logger.info(`*** checked for worker status: ${verb} (event loop delay: ${delay}ms)`);
});

multiWorker.start();
