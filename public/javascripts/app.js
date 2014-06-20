var app = angular.module('softindex', ["highcharts-ng", "btford.socket-io"]).
    factory('mySocket', function (socketFactory) {
      return socketFactory();
    });

app.controller('PollsController', ['$scope', '$http', 'mySocket', function($scope, $http, socket) {
  $scope.polls = [];

  $http.get('/polls').success(function(polls) {
    $scope.polls = polls;
  });

  socket.on('poll-delete', function(poll){
    for (var i in $scope.polls) {
      if ($scope.polls[i]._id == poll._id) {
        $scope.polls.splice(i, 1);
      }
    }
  });

  socket.on('poll-create', function(poll){
    $scope.polls.push(poll);
  });
}]);

app.controller('PollController', ['$scope', '$http', 'mySocket', function($scope, $http, socket) {
  $scope.variants = [];

  $scope.init = function(poll) {
    $scope.poll = poll;

    $scope.chartConfig = {
      title: {
        text: poll.name
      },

      options: {
        chart: {
          renderTo: 'container',
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false
        },

        tooltip: {
          formatter: function() {
            return this.point.name + '<br/><b>' + this.percentage.toFixed(2) + '%</b>';
          }
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            size: '55%',
            dataLabels: {
              enabled: true,
              color: '#000000',
              connectorColor: '#000000',
              formatter: function() {
                return '<b>'+ this.point.name +'</b>: '+ this.percentage.toFixed(2) + '% - ' + this.y;
              }
            }
          }
        }
      },

      series: [{
        type: 'pie',
        data: poll.votes
      }]
    };
  };

  $scope.vote = function(variant) {
    $http.post('/polls/' + $scope.poll._id + '/vote', {variant: variant});
  };

  socket.on('poll-update', function(poll){
    if ($scope.poll._id == poll._id) {
      $scope.poll.votes = poll.votes;
      $scope.poll.variants = poll.variants;
      $scope.poll.name = poll.name;

      $scope.chartConfig.series[0].data = poll.votes;
      $scope.chartConfig.title.text = poll.name;
    }
  });
}]);