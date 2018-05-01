/* global $, angular */
var script = document.querySelector('script[data-under13]');
var userSharingDisabled = JSON.parse(script.dataset.sharingdisabled);

// Declare app level module which depends on filters, and services
angular.module('projectsApp', [
  'ngRoute',
  'ngResource',
  'projectsApp.controllers',
  'projectsApp.services'
]).config(['$routeProvider', function ($routeProvider) {
  $routeProvider.when('/',
      {templateUrl: '/projects/angular', controller: 'ProjectsController'});
  $routeProvider.otherwise({redirectTo: '/'});
}]);

// SERVICES
var services = angular.module('projectsApp.services', [])
    .value('version', '0.1');

// Section service. see sites.v3/code.org/routes/v2_section_routes.rb
services.factory('projectsService', ['$resource',
  function ($resource) {
    var Project = $resource('/v3/channels/:id', {}, {
      // default methods: see https://code.angularjs.org/1.2.21/docs/api/ngResource/service/$resource
      //  'get':    {method: 'GET'},
      //  'save':   {method: 'POST'},
      //  'query':  {method: 'GET', isArray:true},
      //  'remove': {method: 'DELETE'},
      //  'delete': {method: 'DELETE'} // don't use this because it doesn't work in IE9
    });

    Project.prototype.url = function () {
      if (this.level && this.id) {
        return this.level.replace(/\/p\//, '/projects/') + '/' + this.id;
      } else {
        return null;
      }
    };

    Project.prototype.editUrl = function () {
      if (this.url()) {
        return this.url() + "/edit";
      } else {
        return null;
      }
    };

    Project.prototype.thumbnail = function () {
      if (this.thumbnailUrl) {
        return this.thumbnailUrl;
      } else {
        return '/blockly/media/projects/project_default.png';
      }
    };

    Project.prototype.getType = function () {
      // Until projectType is back-filled, check level when projectType is missing.
      return this.projectType ?
        this.projectType :
        this.level && this.level.substr('/projects/'.length);
    };

    Project.prototype.isPublishableProjectType = function () {
      var projectType = this.getType();
      var publishableTypes = userSharingDisabled ?
        window.AlwaysPublishableProjectTypes :
        window.AllPublishableProjectTypes;
      return publishableTypes.indexOf(projectType) > -1;
    };

    return Project;
  }]);

// CONTROLLERS

var controllers = angular.module('projectsApp.controllers', [])
    .value('version', '0.1');

controllers.controller('ProjectsController', ['$scope', '$http', '$route', '$routeParams', '$location', '$window', 'projectsService',
    function ($scope, $http, $route, $routeParams, $location, $window, projectsService) {
  $scope.projectsLoaded = false;

  $scope.projects = projectsService.query();

  // set initial sort order
  $scope.order = 'updatedAt';
  $scope.reverse = true;

  $scope.projects.$promise.then(function (projects) {
    $scope.projectsLoaded = true;
  }).catch($scope.genericError);

  $scope.projectVisible = function (project) {
    return (!project.hidden);
  };

  $scope.genericError = function (result) {
    $window.alert("An unexpected error occurred, please try again. If this keeps happening, try reloading the page.");
  };

  $scope.removeProject = function (project) {
    project.$remove({id: project.id}, function () {
      $scope.projects.splice($.inArray(project, $scope.projects), 1);
    });
  };

  $scope.showPublishProjectDialog = function (project) {
    var projectType = getProjectType(project);
    window.onShowConfirmPublishDialog(project.id, projectType);
  };

  // Make this method available to projects/index.js. This can go away
  // once this file is moved to React.
  window.setProjectPublishedAt = function (projectId, publishedAt) {
    for (var i = 0; i < $scope.projects.length; i++) {
      var project = $scope.projects[i];
      if (project.id === projectId) {
        project.publishedAt = publishedAt;
        break;
      }
    }

    // Refresh the UI
    $scope.$apply();
  };

  $scope.unpublishProject = function (project) {
    $http({
      method:'POST',
      url: '/v3/channels/' + project.id + '/unpublish',
    }).then(function (response) {
      if (response.data) {
        project.publishedAt = null;
      }
    });
  };
}]);

function getProjectType(project) {
  return project.level.split('/')[2];
}
