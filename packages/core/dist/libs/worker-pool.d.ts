/**
 * A worker pool job is queued to a worker pool and is executed by a worker.
 */
export type WorkerPoolJob = {
    /**
     * A JSON serializable object that is passed to the worker.
     */
    message: any;
    /**
     * Any array buffers (transferable) that are passed to the worker.
     */
    buffers?: ArrayBufferLike[];
    /**
     * A callback that is called when the worker has finished executing the job.
     *
     * @param value The result of the job.
     */
    resolve: (value: any) => void;
};
/**
 * Parameters to create a worker pool.
 */
export type WorkerPoolOptions = {
    /**
     * The maximum number of workers to create. Defaults to `8`.
     */
    maxWorker: number;
};
/**
 * A pool of web workers that can be used to execute jobs. The pool will create
 * workers up to the maximum number of workers specified in the options.
 * When a job is queued, the pool will find the first available worker and
 * execute the job. If no workers are available, the job will be queued until
 * a worker becomes available.
 */
export declare class WorkerPool {
    Proto: new () => Worker;
    options: WorkerPoolOptions;
    /**
     * The queue of jobs that are waiting to be executed.
     */
    queue: WorkerPoolJob[];
    /**
     * A static count of working web workers across all worker pools.
     */
    static WORKING_COUNT: number;
    /**
     * The list of workers in the pool.
     */
    private workers;
    /**
     * The list of available workers' indices.
     */
    private available;
    /**
     * Create a new worker pool.
     *
     * @param Proto The worker class to create.
     * @param options The options to create the worker pool.
     */
    constructor(Proto: new () => Worker, options?: WorkerPoolOptions);
    /**
     * Append a new job to be executed by a worker.
     *
     * @param job The job to queue.
     */
    addJob: (job: WorkerPoolJob) => void;
    postMessage: (message: any, buffers?: ArrayBufferLike[]) => void;
    /**
     * Process the queue of jobs. This is called when a worker becomes available or
     * when a new job is added to the queue.
     */
    private process;
    /**
     * Whether or not are there no available workers.
     */
    get isBusy(): boolean;
    /**
     * The number of workers that are simultaneously working.
     */
    get workingCount(): number;
}
//# sourceMappingURL=worker-pool.d.ts.map