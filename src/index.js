require("./models/User");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const requireAuth = require("./middlewares/requireAuth");
const client = require("prom-client");
const cors = require("cors");
const path = require("path");
const server = "127.0.0.1:27017"; // REPLACE WITH YOUR DB SERVER
const database = "db-bank";

app = express();
app.options("/signin", cors());
app.use(cors());
app.use(bodyParser.json());
app.use(authRoutes);

const mongoUri = `mongodb://${server}/${database}`;
if (!mongoUri) {
  throw new Error(`MongoURI was not supplied.`);
}
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});
mongoose.connection
  .once("open", () => {
    console.log("Connected to mongo instance");
  })
  .on("error", (err) => {
    console.error("Error connecting to mongo", err);
  });

///app.use(express.static(path.join(__dirname, "build")));

app.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Origin",
    "https://localhost:3001",
    "https://localhost:9090",
    "https://localhost:3002"
  ); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics({ timeout: 5000 });
const counter = new client.Counter({
  name: "node_requests_operations_total",
  help: "The total no of processed requests",
});

const histogram = new client.Histogram({
  name: "node_request_duration_seconds",
  help: "Histogram for the duration in seconds",
  buckets: [1, 2, 5, 6, 10],
});

let start = new Date();

app.get("/", requireAuth, (req, res) => {
  const user = req.user;
  let end = new Date() - start;
  histogram.observe(end / 1000); /// chnaging in seconds
  counter.inc(10);
  res.send(user);
});

app.get("/signin", requireAuth, (req, res) => {
  res.send(`Your email: ${req.user.email}`);
});

app.get("/metrics", (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(client.register.metrics());
});

app.listen(3004, () => {
  console.log("Listening on port 3004");
});
