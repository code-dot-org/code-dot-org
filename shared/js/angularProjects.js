/* global $, angular */

var script = document.querySelector('script[data-under13]');
var isUnder13 = JSON.parse(script.dataset.under13);

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
        this.level.substr('/projects/'.length);
    };

    Project.prototype.isPublishableProjectType = function () {
      var projectType = this.getType();
      var publishableTypes = isUnder13 ?
        ['artist', 'playlab'] :
        ['applab', 'gamelab', 'artist', 'playlab'];
      return publishableTypes.indexOf(projectType) > -1;
    };

    return Project;
  }]);

// CONTROLLERS

var controllers = angular.module('projectsApp.controllers', [])
    .value('version', '0.1');

controllers.controller('ProjectsController', ['$scope', '$http', '$route', '$routeParams', '$location', '$window', 'projectsService',
    function ($scope, $http, $route, $routeParams, $location, $window, projectsService) {
  $scope.isPublicGalleryEnabled = $('#angular-my-projects-wrapper').attr('data-isPublicGalleryEnabled');
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
    window.onShowConfirmPublishDialog(publishProject.bind(this, project));
  };

  var PROJECT_TYPES = ['applab', 'gamelab', 'weblab', 'artist', 'playlab'];

  function publishProject(project) {
    var type = getProjectType(project);
    if (PROJECT_TYPES.indexOf(type) === -1) {
      throw 'Cannot publish project of type "' + type + '"';
    }
    $http({
      method:'POST',
      url: '/v3/channels/' + project.id + '/publish/' + type,
    }).then(function (response) {
      if (response.data && response.data.publishedAt) {
        project.publishedAt = response.data.publishedAt;
      }
    });
  }

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
