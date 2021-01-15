import { runConcurrentBatch } from '../index'

const TESTS_TO_RUN = 100

const fallibleFnFactory = (shouldFail: boolean = false, length: number = 10) => () =>
  new Promise((resolve, reject) => {
    setTimeout(() => (shouldFail ? reject('error') : resolve('done!')), length)
  })

describe(runConcurrentBatch, () => {
  it('Should always return results with no error rate', async done => {
    const functions = Array(TESTS_TO_RUN)
      .fill(0)
      .map(() => fallibleFnFactory())
    const [results, errors] = await runConcurrentBatch(functions, 5)
    expect(Object.values(results).length).toBe(TESTS_TO_RUN)
    expect(Object.values(errors).length).toBe(0)
    done()
  })
  it('Should return half results with 0.5 error rate', async done => {
    const functions = Array(TESTS_TO_RUN)
      .fill(0)
      .map((_, idx) => fallibleFnFactory(idx % 2 === 0))
    const [results, errors] = await runConcurrentBatch(functions, 5)
    expect(Object.values(results).length / TESTS_TO_RUN).toBeCloseTo(0.5)
    expect(Object.values(errors).length / TESTS_TO_RUN).toBe(0.5)
    done()
  })
  it('Should not run more than n promises at the same time', async done => {
    let runningAtTheSameTime = 0
    let maxRunningAtTheSameTime = 0
    const functions = Array(TESTS_TO_RUN)
      .fill(0)
      .map(() => async () => {
        runningAtTheSameTime++
        maxRunningAtTheSameTime = Math.max(runningAtTheSameTime, maxRunningAtTheSameTime)
        await fallibleFnFactory(false, 50 + 50 * Math.random())()
        runningAtTheSameTime--
      })
    await runConcurrentBatch(functions, 5)
    expect(runningAtTheSameTime).toBe(0)
    expect(maxRunningAtTheSameTime).toBe(5)
    done()
  })
})
