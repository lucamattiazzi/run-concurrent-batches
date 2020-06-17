"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.keepRunningConcurrentBatch = exports.runConcurrentBatch = void 0;
function runConcurrentBatch(functions, batchSize) {
    return __awaiter(this, void 0, void 0, function* () {
        const functionsToRun = [...functions];
        const currentlyRunning = {};
        const results = {};
        const errors = {};
        while (functionsToRun.length || Object.values(currentlyRunning).length) {
            while (Object.values(currentlyRunning).length < batchSize && functionsToRun.length) {
                const instanceIdx = functions.length - functionsToRun.length;
                const instance = functionsToRun.shift();
                const promisifiedInstance = new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const result = yield instance(instanceIdx);
                        resolve([instanceIdx, result, false]);
                    }
                    catch (err) {
                        resolve([instanceIdx, null, err]);
                    }
                }));
                currentlyRunning[instanceIdx] = promisifiedInstance;
            }
            const currentBatch = Object.values(currentlyRunning);
            const [resolvedIdx, resolvedResults, resolvedErr] = yield Promise.race(currentBatch);
            delete currentlyRunning[resolvedIdx];
            if (resolvedErr) {
                errors[resolvedIdx] = resolvedErr;
            }
            else {
                results[resolvedIdx] = resolvedResults;
            }
        }
        return [results, errors];
    });
}
exports.runConcurrentBatch = runConcurrentBatch;
function keepRunningConcurrentBatch(fn, batchSize) {
    const currentlyRunning = {};
    const results = {};
    const errors = {};
    let instanceIdx = 0;
    let active = false;
    function start() {
        if (active)
            return;
        active = true;
        run();
    }
    function run() {
        if (!active)
            return;
        while (Object.values(currentlyRunning).length < batchSize) {
            addToBatch(instanceIdx);
        }
    }
    function stop() {
        active = false;
    }
    function addToBatch(idx) {
        const promisifiedInstance = new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield fn(idx);
                results[idx] = result;
            }
            catch (err) {
                errors[idx] = err;
            }
            finally {
                delete currentlyRunning[idx];
                if (active)
                    addToBatch(instanceIdx);
                resolve();
            }
        }));
        currentlyRunning[instanceIdx] = promisifiedInstance;
        instanceIdx++;
    }
    return {
        start,
        stop,
        errors,
        results,
        currentlyRunning,
    };
}
exports.keepRunningConcurrentBatch = keepRunningConcurrentBatch;
//# sourceMappingURL=index.js.map