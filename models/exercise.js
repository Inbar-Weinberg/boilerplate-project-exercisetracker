const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  description: String,
  duration: Number,
  date: { type: Date, default: new Date() },
});

exerciseSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("exercise", exerciseSchema);
