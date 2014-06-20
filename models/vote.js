var mongoose = require('mongoose');
var Poll = require('./poll');

var voteSchema = mongoose.Schema({
  session_id: {
    type: String,
    required: true
  },

  poll_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  variant: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Vote', voteSchema);
