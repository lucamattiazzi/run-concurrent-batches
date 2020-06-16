import { runConcurrentBatch } from '../index'

const TESTS_TO_RUN = 100

const testFunctFactory = (errRate: number) => () =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      Math.random() < errRate ? reject('error') : resolve('done!')
    }, 100)
  })

describe(runConcurrentBatch, () => {
  it('Should always return results with no error rate', async (done) => {
    const functions = Array(TESTS_TO_RUN)
      .fill(0)
      .map(() => testFunctFactory(0))
    const [results, errors] = await runConcurrentBatch(functions, 5)
    expect(Object.values(results).length).toBe(TESTS_TO_RUN)
    expect(Object.values(errors).length).toBe(0)
    done()
  })
  it('Should return ~ half results with 0.5 error rate', async (done) => {
    const functions = Array(TESTS_TO_RUN)
      .fill(0)
      .map(() => testFunctFactory(0.5))
    const [results, errors] = await runConcurrentBatch(functions, 5)
    expect(Object.values(results).length / TESTS_TO_RUN).toBeCloseTo(0.5)
    expect(Object.values(errors).length / TESTS_TO_RUN).toBe(0.5)
    done()
  })
})
