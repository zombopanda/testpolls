var mongoose = require('mongoose');
var Vote = require('./vote');
var _ = require('lodash');
var Schema = mongoose.Schema;

var pollSchema = Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },

  variants: {
    type: [String],
    required: true
  },

  votes: [Schema.Types.Mixed]
});

pollSchema.methods.calculate = function(cb) {
  var poll = this;

  Vote.find({poll_id: this.id}, function(err, votes) {
    poll.votes = _.pairs(_.countBy(votes, function (vote) {
      return vote.variant;
    }));
    poll.save(function() {
      cb(poll);
    });
  });
};

module.exports = mongoose.model('Poll', pollSchema);
