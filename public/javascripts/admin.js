var app = angular.module('softindex-admin', ["ui.router"])
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/polls');

      var pollsTemplate = $('#polls-template').html();
      var pollsEditTemplate = $('#polls-edit-template').html();

      $stateProvider
      .state('polls', {
        url: '/polls',
        template: pollsTemplate
      })
      .state('pollsCreate', {
        url: '/polls/new',
        template: pollsEditTemplate
      })
      .state('pollsEdit', {
        url: '/polls/{pollId:[a-z0-9]+}/edit',
        template: pollsEditTemplate
      });
  }]);

app.controller('PollsController', ['$scope', '$http', '$state', function($scope, $http, $state) {
  $scope.polls = [];

  $scope.create = function() {
    $state.go('pollsCreate');
  };

  $scope.delete = function(poll) {
    $http.delete('/polls/' + poll._id).success(function() {
      for (var i in $scope.polls) {
        if ($scope.polls[i]._id == poll._id) {
          $scope.polls.splice(i, 1);
        }
      }
    });
  };

  $http.get('/polls').success(function(polls) {
    $scope.polls = polls;
  });
}]);

app.controller('EditController', ['$scope', '$state', '$http', '$stateParams',
function($scope, $state, $http, $stateParams) {
  if ($stateParams.pollId) {
    $http.get('/polls/' + $stateParams.pollId).success(function(poll) {
      $scope.poll = poll;
    });
  } else {
    $scope.poll = {name: '', variants: ['']};
  }

  $scope.addVariant = function() {
    $scope.poll.variants.push('');
  };

  $scope.save = function() {
    var success = function() {
      $state.go('polls');
    };

    if ($scope.poll._id) {
      $http.put('/polls/' + $scope.poll._id, $scope.poll).success(success);
    } else {
      $http.post('/polls/', $scope.poll).success(success);
    }
  };

  $scope.back = function() {
    $state.go('polls');
  };
}]);
