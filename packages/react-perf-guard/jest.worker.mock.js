// jest.worker.mock.js
//
// Runs the ACTUAL worker source (WORKER_SOURCE, exported from
// src/worker/createWorker.ts — the exact string shipped to the browser)
// inside a Node vm sandbox, instead of a hand-maintained reimplementation
// of the rule engine. jsdom mocks URL.createObjectURL to a fixed string
// (see jest.setup.js), which throws away the real Blob content, so without
// this the tests would validate a second, separately-drifting copy of the
// rule logic rather than what actually ships.
const vm = require("vm");
const { WORKER_SOURCE } = require("./src/worker/createWorker");

class WorkerMock {
  constructor() {
    this.onmessage = null;
    this.onerror = null;

    const sandboxSelf = {
      onmessage: null,
      postMessage: (data) => {
        // Worker -> main thread, delivered async like a real worker.
        setTimeout(() => {
          if (this.onmessage) this.onmessage({ data });
        }, 0);
      },
    };

    const context = vm.createContext({ self: sandboxSelf, console });
    vm.runInContext(WORKER_SOURCE, context);
    this._sandboxSelf = sandboxSelf;
  }

  postMessage(msg) {
    // Main thread -> worker, delivered async like a real worker.
    setTimeout(() => {
      if (this._sandboxSelf.onmessage) {
        this._sandboxSelf.onmessage({ data: msg });
      }
    }, 0);
  }

  terminate() {
    this.onmessage = null;
    this.onerror = null;
  }
}

module.exports = WorkerMock;
