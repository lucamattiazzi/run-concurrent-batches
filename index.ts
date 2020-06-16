type ConcurrentFunction<T = any> = (idx?: number) => T
type WrappedResults<T> = [number, T, any]
type WrappedPromise<T> = Promise<WrappedResults<T>>
type ResultDict<T> = Record<number, T>
type ErrorDict = Record<number, any>

export async function runConcurrentBatch<T = any>(
  functions: ConcurrentFunction[],
  batchSize: number,
): Promise<[ResultDict<T>, ErrorDict]> {
  const functionsToRun = [...functions]
  const currentlyRunning: Record<number, WrappedPromise<T>> = {}
  const results: ResultDict<T> = {}
  const errors: ErrorDict = {}
  while (functionsToRun.length || Object.values(currentlyRunning).length) {
    while (Object.values(currentlyRunning).length < batchSize && functionsToRun.length) {
      const instanceIdx = functions.length - functionsToRun.length
      const instance = functionsToRun.shift()
      const promisifiedInstance: WrappedPromise<T> = new Promise(async (resolve) => {
        try {
          const result = await instance(instanceIdx)
          resolve([instanceIdx, result, false])
        } catch (err) {
          resolve([instanceIdx, null, err])
        }
      })
      currentlyRunning[instanceIdx] = promisifiedInstance
    }
    const currentBatch = Object.values(currentlyRunning)
    const [resolvedIdx, resolvedResults, resolvedErr] = await Promise.race(currentBatch)
    delete currentlyRunning[resolvedIdx]
    if (resolvedErr) {
      errors[resolvedIdx] = resolvedErr
    } else {
      results[resolvedIdx] = resolvedResults
    }
  }
  return [results, errors]
}
