var express = require('express');
var router = express.Router();
var Poll = require('../models/poll');
var Vote = require('../models/vote');
var _ = require('lodash');

// POST /polls
router.post('/', function (req, res) {
  var poll = new Poll(req.body);
  poll.save(function (err, poll) {
    if (err) {
      res.send(400, 'validation error');
    }

    io.emit('poll-create', poll);
    res.send(poll);
  });
});

// GET /polls
router.get('/', function (req, res) {
  Poll.find(function (err, models) {
    if (!err) {
      res.send(models);
    }
  });
});

// GET /polls/:poll_id
router.get('/:poll_id', function (req, res) {
  Poll.findById(req.params.poll_id, function (err, poll) {
    if (err) {
      res.send(404, 'not found');
    }
    res.send(poll);
  });
});

// PUT /polls/:poll_id
router.put('/:poll_id', function (req, res) {
  Poll.findById(req.params.poll_id, function (err, poll) {
    if (err) {
      res.send(404, 'not found');
    }
    poll.set(_.pick(req.body, 'name', 'variants'));
    poll.save(function(err) {
      if (err) {
        res.send(400, 'validation error');
      }

      io.emit('poll-update', poll);
      res.send(poll);
    });
  });
});

// DELETE /polls/:poll_id
router.delete('/:poll_id', function (req, res) {
  Poll.findById(req.params.poll_id, function (err, poll) {
    if (err) {
      res.send(404, 'not found');
    }
    poll.remove(function(err) {
      if (!err) {

        io.emit('poll-delete', poll);
        res.send(200);
      }
    });
  });
});

// POST /polls/:poll_id/vote
router.post('/:poll_id/vote', function (req, res, next) {
  Poll.findById(req.params.poll_id, function (err, poll) {
    if (err) {
      res.send(404, 'not found');
    }

    if (!req.body.variant || poll.variants.indexOf(req.body.variant) === -1) {
      res.send(400, 'validation error');
    }

    Vote.remove({session_id: req.session.uid, poll_id: poll.id}, function (err) {
      if (err) {
        next(err);
      }

      var vote = new Vote({session_id: req.session.uid, poll_id: poll.id, variant: req.body.variant});

      vote.save(function (err) {
        if (err) {
          res.send(400, 'validation error');
        }

        poll.calculate(function (poll) {
          io.emit('poll-update', poll);
        });

        res.send(200);
      });
    });
  });
});


module.exports = router;
