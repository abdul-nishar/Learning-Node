const fs = require("fs");

setTimeout(() => console.log("Timeout 1 finished"), 0);
setImmediate(() => console.log("Immediate 1 finished"));

fs.readFile("test-file.js", () => console.log("I/O finished"));

console.log("Hello from the top level code");
