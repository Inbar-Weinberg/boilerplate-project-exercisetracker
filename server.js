require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const dateFormat = require("dateformat");

const User = require("./models/user");
const Exercise = require("./models/exercise");
const Connection = require("./models");

app.use(cors());
app.use(express.static("public"));
app.use(
  express.urlencoded({
    extended: true,
  })
);

//--
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get(`/api/exercise/users`, async (request, response, next) => {
  try {
    const users = await User.find({});
    console.log("users");
    response.status(200).json(users);
  } catch (error) {
    next(error);
  }
});
//--

app.post(`/api/exercise/new-user`, async (request, response, next) => {
  try {
    let username = request.body.username;
    const user = new User({ username: username });
    let savedUser = await user.save();
    let savedAndFormattedUser = savedUser.toJSON();
    response.json(savedAndFormattedUser);
  } catch (error) {
    next(error);
  }
  /*  user.save((err, data) => {
    console.log(data);
    return response
      .status(201)
      .json({ username: data.username, _id: data._id });*/
});

app.post(`/api/exercise/add`, async (request, response, next) => {
  try {
    const exercise = {
      duration: request.body.duration,
      description: request.body.description,
      date: request.body.date ? request.body.date : undefined,
    };
    const dateToPrint = dateFormat(exercise.date, "ddd mmm dd yyyy");

    User.findById(userId).then((user) => {
      user.log.push(exercise);
      user.save();
      response
        .status(200)
        .json({ userId, description, duration, date: dateToPrint });
    });
  } catch (error) {
    next(error);
  }
});
//Mon Jan 01 1990
//-- error handler
const errorHandler = (error, request, response, next) => {
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
