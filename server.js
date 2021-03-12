const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const User = require("./models/user");

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.post(`/api/exercise/new-user`, (request, response, next) => {
  let username = request.body.username;
  const user = new User({ username: username });
 /*
  user
    .save()
    .then((savedUser) => savedUser.toJSON())
    .then((savedAndFormattedUser) => response.json(savedAndFormattedUser))
    .catch((error) => next(error));
    */
    user.save((err, data) => {
      console.log(data);
      return response.status(201).json({username: data.username, _id: data._id});
    });
});

//-- error handler
const errorHandler = (error, request, response, next) => {
  console;
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else {
    return response.status(500).json({ error: error.message });
  }
};
app.use(errorHandler);

//--
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
