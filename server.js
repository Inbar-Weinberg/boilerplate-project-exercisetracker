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
    let users = await User.find({}).exec();
    users.forEach((user) =>
      user.log.forEach((exercise) => {
        exercise = JSON.parse(JSON.stringify(exercise));
        exercise.date = dateFormat(exercise.date, "ddd mmm dd yyyy");
      })
    );

    response.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

app.get(`/api/exercise/log/`, async (request, response, next) => {
  try {
    const userId = request.query.userId;
    const user = await User.findById(userId).exec();

    const fromDate = request.query.from
      ? queryToDate(request.query.from)
      : new Date(0);
    const toDate = request.query.to
      ? queryToDate(request.query.to)
      : new Date();

    let filteredLog = user.log.filter(
      (exercise) => exercise.date >= fromDate && exercise.date <= toDate
    );

    const limit = request.query.limit
      ? request.query.limit
      : filteredLog.length;
    filteredLog.splice(limit);

    filteredLog.forEach((exercise) => {
      exercise = JSON.parse(JSON.stringify(exercise));
      exercise.date = dateFormat(exercise.date, "ddd mmm dd yyyy");
    });

    let returnedUser = {
      _id: user._id,
      username: user.username,
      log: filteredLog,
      count: limit,
    };
    response.json(returnedUser);
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
    const exercise = { duration, description, date };

    User.findByIdAndUpdate(
      userId,
      { $push: { log: exercise } },
      { new: true }
    ).then((user) => {
      response.status(200).json({
        username: user.username,
        _id: userId,
        description,
        duration,
        date: dateFormat(date, "ddd mmm dd yyyy"),
      });
    });
  } catch (error) {
    next(error);
  }
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

function queryToDate(query) {
  let year = parseInt(query.substring(0, 4));
  let month = parseInt(query.substring(5, 7));
  let day = parseInt(query.substring(8));

  let date = new Date(year, month - 1, day);
  return date;
}
