/*jshint esversion: 9 */

// importing the dependencies
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { startDatabase } = require("./database/mongo");
const { insertTodo, getTodos } = require("./database/todos");
const { deleteTodo, updateTodo } = require("./database/todos");
// const jwt = require("express-jwt");
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");

// defining the Express app
const app = express();

// adding Helmet to enhance your API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan("combined"));

// stetting up port for deploy on Heroku
const serverPort = 8080;
const port = process.env.PORT || serverPort;

// defining an endpoint to return all todos
app.get("/", async (req, res) => {
  res.send(await getTodos());
});

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://dev-ly01f1vuvnmfywij.us.auth0.com/.well-known/jwks.json`,
  }),

  // Validate the audience and the issuer.
  audience: "https://todobckend.herokuapp.com/",
  issuer: `https://dev-ly01f1vuvnmfywij.us.auth0.com/`,
  algorithms: ["RS256"],
});

app.use(checkJwt);

app.post("/", async (req, res) => {
  const newTodo = req.body;
  await insertTodo(newTodo);
  res.send({ message: "New Todo inserted." });
});

app.use(checkJwt);

// endpoint to delete an todo
app.delete("/:id", async (req, res) => {
  await deleteTodo(req.params.id);
  res.send({ message: "Todo removed." });
});

app.use(checkJwt);

// endpoint to update an todo
app.put("/:id", async (req, res) => {
  const updatedTodo = req.body;
  await updateTodo(req.params.id, updatedTodo);
  res.send({ message: "Todo updated." });
});

// start the in-memory MongoDB instance
startDatabase().then(async () => {
  await insertTodo({ title: "Hello, now from the in-memory database!" });

  // starting the server
  app.listen(port, () => {
    console.log("listening on port 8080");
  });
});
