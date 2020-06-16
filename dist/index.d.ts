declare type ConcurrentFunction<T = any> = (idx?: number) => T;
declare type ResultDict<T> = Record<number, T>;
declare type ErrorDict = Record<number, any>;
export declare function runConcurrentBatch<T = any>(functions: ConcurrentFunction[], batchSize: number): Promise<[ResultDict<T>, ErrorDict]>;
export {};
