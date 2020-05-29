const { MongoPrometheus } = require("mongo-prometheus");

const config = {
  database: "db-bank",
  collection: "users",
  job: "mongo-prometheus",
  defaultMetrics: true,
};

const etl = (data, next) => {
  const record = {
    metric: "test_metric",
    value: data.total,
    type: "counter",
    label: "test",
  };
  next(null, record);
};

new MongoPrometheus(config, etl);
