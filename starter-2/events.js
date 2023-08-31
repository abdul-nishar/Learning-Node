// Importing EventEmitter class from events modules
const EventEmitter = require("events");
const http = require("http");
// Creating a new class from EventEmitter class
class Sales extends EventEmitter {
  constructor() {
    super();
  }
}
// Creating a new instance from Sales class
const myEmitter = new Sales();

// OBSERVERS
myEmitter.on("newSale", () => {
  console.log("There was a new sale!");
});

myEmitter.on("newSale", () => {
  console.log("Customer name: Jonas");
});

// Using arguments with observers
myEmitter.on("newSale", (stock) => {
  console.log(`There are ${stock} items left in the stock.`);
});

// EMITTER
myEmitter.emit("newSale", 9);

// ---------------------------------------------------------------- //

const server = http.createServer();

server.on("request", (req, res) => {
  console.log("Request received");
  res.end("Request received");
});

server.on("request", (req, res) => {
  console.log("Another request received");
});

server.on("close", () => {
  console.log("Server closed");
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Waiting for requests...");
});
