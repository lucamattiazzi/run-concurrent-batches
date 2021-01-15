# Run Concurrent Batches

Allows to run N concurrent promises at the same time and once one is resolved another one starts fulfilling.

Either it receives a pool of M promises that will be run in a moving batch of size N, or a single promise that will be run as a batch of size N until stopped.


```ts
import { runConcurrentBatch } from 'chunkier'
import { urlsToVisit } from './constants'

async function request(url: string) {
  return runAsyncHTTPRequest(url)
}

const functions = urlsToVisit.map(url => () => request(url))


// [ [ 1, 2 ], [ 3 ], [ 4, 5 ], [ 6 ], [ 7, 8 ], [ 9 ] ]
```
