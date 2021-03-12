require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const dateFormat = require("dateformat");

const User = require("./models/user");
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
    response.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

app.get(`/api/exercise/log/:userId`, async (request, response, next) => {
  try {
    const userId = request.params.userId;
    const user = await User.findById(userId);
    let savedAndFormattedUser = user.toJSON();
    response.json(savedAndFormattedUser);
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
});

app.post(`/api/exercise/add`, async (request, response, next) => {
  try {
    const { userId, description } = request.body;
    const duration = Number(request.body.duration);
    let date = request.body.date ? request.body.date : new Date();
    date = dateFormat(date, "ddd mmm dd yyyy");
    const exercise = { duration, description, date };
    console.log(exercise);

    User.findByIdAndUpdate(userId, { $push: { log: exercise } }, { new: true })
      .then((user) => {
        response.status(200).json({
          username: user.username,
          _id: userId,
          description,
          duration,
          date,
        });
      });
  } catch (error) {
    next(error);
  }
  /*
        .then((user) => {
        user.log.push(exercise);
        user.save();
        return user;
      })
  */
});

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
