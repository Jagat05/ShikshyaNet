const http = require("http");
const port = 3000;
const app = require("./app");

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`App is running on port ${port}!`);
});
