declare type ConcurrentFunction<T = any> = (idx?: number) => T;
declare type WrappedResults<T> = [number, T, any];
declare type WrappedPromise<T> = Promise<WrappedResults<T>>;
declare type ResultDict<T> = Record<number, T>;
declare type ErrorDict = Record<number, any>;
declare type StoppableConcurrentBatch<T> = {
    start: () => void;
    stop: () => void;
    results: ResultDict<T>;
    errors: ErrorDict;
    currentlyRunning: Record<number, WrappedPromise<T>>;
};
export declare function runConcurrentBatch<T = any>(functions: ConcurrentFunction<T>[], batchSize: number): Promise<[ResultDict<T>, ErrorDict]>;
export declare function keepRunningConcurrentBatch<T = any>(fn: ConcurrentFunction<T>, batchSize: number): StoppableConcurrentBatch<T>;
export {};
