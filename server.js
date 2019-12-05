const MongoClient = require("mongodb").MongoClient;
const express = require("express");
const objectId = require("mongodb").objectId;

const app = express();
const jsonParser = express.json();

const mongoClient = new MongoClient(
  "mongodb+srv://yariko2012:magana2012@cluster0-gfvwi.mongodb.net/admin?retryWrites=true&w=majority",
  { useNewUrlParser: true }, {useUnifiedTopology: true}
);

let dbClient;

app.use(express.static(__dirname + "/"));

mongoClient.connect(function(err, client) {
  if (err) return console.log(err);
  dbClient = client;
  app.locals.collection = client.db("project_PE").collection("messages");
  app.listen(3000, function() {
    console.log("Сервер ожидает подключения..");
  });
});



app.get("/api/messages:id", function(req, res) {
  const id = new objectId(req.params._id);
  const collection = req.app.locals.collection;
  collection.findOne({ _id: id }, function(err, message) {
    if (err) return console.log(err);
    res.send(message);
  });
});

app.get("/api/messages", function(req, res) {

  const collection = req.app.locals.collection;
  collection.find({}).toArray(function(err, messages) {
    if (err) return console.log(err);
    res.send(messages);
  });
});


app.post("/api/messages", jsonParser, function(req, res) {
  if (!req.body) return res.sendStatus(400);

  const userName = req.body.name;
  const userText = req.body.message;
  const collection = req.app.locals.collection;
  const message = { name: userName, message: userText};
  collection.insertOne(message, function(err, result) {
    if (err) return console.log(err);
    res.send(message);
  });
});


  /*app.get("/api/messages", jsonParser, function(req, res) {
  if (!req.body) return res.sendStatus(400);

  const offset = req.params.offset;
  const counter = req.params.counter;
  
  const collection = req.app.locals.collection;
    collection.find({}.sort({$natural: -1}).skip(offset).limit(counter)).toArray(function(err, messages) {
    if (err) return console.log(err);
    res.send(messages);
  });

});*/

app.route("/api/messages:id", jsonParser, function(req, res) {
  if (!req.body) return res.sendStatus(400);

  const userName = req.body.name;
  const userText = req.body.message;

  const message = { name: userName, message: userText };
  const collection = req.app.locals.collection;

  collection.insertOne(message, function(err, result) {
    if (err) return console.log(err);
    res.send(message);
  });
});

app.delete("/api/messages:id", function(req, res) {
  
  const id = new objectId(req.params._id);
  const collection = req.app.locals.collection;

  collection.findOneAndDelete({ _id: id }, function(err, result) {
    if (err) return console.log(err);
    let message = result.value;
    res.send(message);
  });
});

app.put("/api/messages", jsonParser, function(req, res) {
  if (!req.body) return res.sendStatus(400);
  const id = new objectId(req.body._id);
  const userName = req.body.name;
  const userText = req.body.message;

  const collection = req.app.locals.collection;
  collection.findOneAndUpdate(
    { _id: id },
    { $set: { name: userName, message: userText } },
    { returnOriginal: false },
    function(err, result) {
      if (err) return console.log(err);
      const message = result.value;
      res.send(message);
    }
  );
});

process.on("SIGINT", () => {
  dbClient.close();
  process.exit();
});
