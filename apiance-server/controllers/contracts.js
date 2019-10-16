const db = require('../models/contracts')
const SwaggerParser = require("swagger-parser");
const moment = require('moment');
const dot = require('dot-object');


//const model = require('../models/contracts');

// Return the list of all articles
exports.findAll = async (request, response) => {
  // const articles = await model.find().sort("_id");
  db.find({}, function (err, docs) {
    // docs is an array containing documents Mars, Earth, Jupiter
    // If no document is found, docs is equal to []
    response.send(docs);
  });

};

exports.findAllNames = async (request, response) => {
  // const articles = await model.find().sort("_id");
  db.find({}, {}, function (err, docs) {
    response.send(docs);
  });

};

exports.findById = async (request, response) => {
  db.find({ _id: request.params.id }, function (err, docs) {
    if (err) {
      response.status(500).send({ error: err });
    } else {
      if (docs.length >= 1) {
        response.send(docs[0])
      } else {
        response.status(500).send({ error: "Multiple documents found" });
      }
    }
  });
};

exports.findSwaggerById = async (request, response) => {
  db.find({ _id: request.params.id }, function (err, docs) {
    if (err) {
      response.status(500).send({ error: err });
    } else {
      if (docs.length >= 1) {
        response.send(docs[0].swagger)
      } else {
        response.status(500).send({ error: "Multiple documents found" });
      }
    }
  });
};

exports.create = async (request, response) => {
  var swaggerDoc = request.body;

  if (swaggerDoc == null) {
    response.status(500).send({ error: "Json Body should not be null" });
  }

  try {
    let swaggerJson = await SwaggerParser.validate(swaggerDoc);

    let contract = {
      dtInsert: moment().unix(),
      swagger: JSON.stringify(swaggerJson)
    };

    db.insert(contract, function (err, newDoc) {
      // newDoc is the newly inserted document, including its _id
      // newDoc has no key called notToBeSaved since its value was undefined
      if (err) {
        console.error(err)
        response.status(500).send({ error: err.toString() });
      } else {
        response.send(newDoc._id);
      }
    });
  }
  catch (err) {
    console.log(err)
    response.status(500).send({ error: err.toString() });
  }
};

exports.update = async (request, response) => {
  response.send([]);
};

exports.delete = async (request, response) => {
  response.send([]);
};

exports.clear = async (request, response) => {
  db.remove({}, { multi: true }, function (err, numRemoved) {
    if (err) {
      response.status(500).send({ error: err.toString() })
    } else {
      response.send({ total: numRemoved })
    }
  })
};
