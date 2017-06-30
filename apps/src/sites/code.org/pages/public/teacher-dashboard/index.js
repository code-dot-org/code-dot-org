/* global angular */

/**
 * Entry point for teacher-dashboard/index.js bundle
 */

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import SectionProjectsList from '@cdo/apps/templates/projects/SectionProjectsList';
import experiments from '@cdo/apps/util/experiments';
import { renderSectionsPage } from './sections';

const script = document.querySelector('script[data-teacherdashboard]');
const scriptData = JSON.parse(script.dataset.teacherdashboard);

main(scriptData);

// Check the experiment at the top level, so that the enableExperiments and
// disableExperiments url params will cause a persistent setting to be stored
// from any page in teacher dashboard.
const showProjectThumbnails = experiments.isEnabled('showProjectThumbnails');

function renderSectionProjects(sectionId) {
  const dataUrl = `/dashboardapi/v1/projects/section/${sectionId}`;
  const element = document.getElementById('projects-list');

  const studioUrlPrefix = scriptData.studiourlprefix;

  $.ajax({
    method: 'GET',
    url: dataUrl,
    dataType: 'json'
  }).done(projectsData => {
    ReactDOM.render(
      <SectionProjectsList
        projectsData={projectsData}
        studioUrlPrefix={studioUrlPrefix}
        showProjectThumbnails={showProjectThumbnails}
      />,
      element);
  });
}

//  Everything below was copied wholesale from index.haml, where we had no linting.
// TODO (bjvanminnen): Fix remaining lint errors and re-enable rules.
/* eslint-disable eqeqeq, no-unused-vars */
function main() {
  const studioUrlPrefix = scriptData.studiourlprefix;
  var valid_scripts = scriptData.valid_scripts;
  var valid_courses = scriptData.valid_courses;
  var hoc_assign_warning = scriptData.hoc_assign_warning;
  var disabled_scripts = scriptData.disabled_scripts;
  var i18n = scriptData.i18n;
  var error_string_none_selected = i18n.error_string_none_selected;
  var error_string_other_section = i18n.error_string_other_section;

  // Sections can be assigned to either a course or a script. Since there's a
  // possibility that we could have a script and a course with the same id, we
  // need a way to differentiate them. We do that by giving scripts and courses
  // assignment ids, which are guaranteed to be unique across the population of
  // both courses and scripts.
  function scriptAssignmentId(script_id) {
    return 's_' + script_id;
  }

  function courseAssignmentId(course_id) {
    return 'c_' + course_id;
  }

  valid_scripts.forEach(function (script) {
    script.assign_id = scriptAssignmentId(script.id);
  });
  valid_courses.forEach(function (course) {
    course.assign_id = courseAssignmentId(course.id);
    course.is_course = true;
  });

  const valid_assignments = valid_courses.concat(valid_scripts);

  // Declare app level module which depends on filters, and services
  angular.module('teacherDashboard', [
    'ngRoute',
    'ngResource',
    'ngSanitize',
    'ngCsv',
    'teacherDashboard.controllers',
    'teacherDashboard.services',
    'teacherDashboard.directives',
    'teacherDashboard.filters'
  ])

  // ROUTES

  .config(['$routeProvider', function ($routeProvider) {
    if (studioUrlPrefix && window.location.search.indexOf("no_home_redirect") === -1) {
      $routeProvider.when('/',
        {redirectTo: function () {
          window.location = `${studioUrlPrefix}/home`;
        }});
    } else {
      $routeProvider.when('/',
      {templateUrl: '/teacher-dashboard/landing'});
    }
    $routeProvider.when('/plan',
        {templateUrl: '/teacher-dashboard/plan'});
    $routeProvider.when('/sections',
        {templateUrl: '/teacher-dashboard/sections', controller: 'SectionsController'});
    $routeProvider.when('/sections/:id',
        {templateUrl: '/teacher-dashboard/section', controller: 'SectionDetailController'});
    $routeProvider.when('/sections/:id/print_signin_cards',
        {templateUrl: '/teacher-dashboard/signin_cards', controller: 'SectionSigninCardsController', tab: 'print_signin_cards'});
    $routeProvider.when('/sections/:id/progress',
        {templateUrl: '/teacher-dashboard/section', controller: 'SectionProgressController', tab: 'progress'});
    $routeProvider.when('/sections/:id/projects',
        {templateUrl: '/teacher-dashboard/section', controller: 'SectionProjectsController', tab: 'projects'});
    $routeProvider.when('/sections/:id/responses',
        {templateUrl: '/teacher-dashboard/section', controller: 'SectionResponsesController', tab: 'responses'});
    $routeProvider.when('/sections/:id/assessments',
        {templateUrl: '/teacher-dashboard/section', controller: 'SectionAssessmentsController', tab: 'assessments'});
    $routeProvider.when('/sections/:id/:tab',
        {templateUrl: '/teacher-dashboard/section', controller: 'SectionDetailController'});
    $routeProvider.when('/sections/:sectionid/student/:studentid',
        {templateUrl: '/teacher-dashboard/student', controller: 'StudentDetailController'});
    $routeProvider.when('/sections/:sectionid/student/:studentid/script/',
        {templateUrl: '/teacher-dashboard/student', controller: 'StudentDetailController'});
    $routeProvider.when('/sections/:sectionid/student/:studentid/script/:scriptid',
        {templateUrl: '/teacher-dashboard/student', controller: 'StudentDetailController'});
    // We have legacy /course routes from a time when course was used synonomously with script
    $routeProvider.when('/sections/:sectionid/student/:studentid/course/',
        {templateUrl: '/teacher-dashboard/student', controller: 'StudentDetailController'});
    $routeProvider.when('/sections/:sectionid/student/:studentid/course/:scriptid',
        {templateUrl: '/teacher-dashboard/student', controller: 'StudentDetailController'});
    $routeProvider.otherwise({redirectTo: '/'});
  }]);

  // DIRECTIVES
  var directives = angular.module('teacherDashboard.directives', [])
    .value('version', '0.1');

  directives.directive('teacherNav', ['$location', '$routeParams', function ($location, $routeParams) {
    return {
      templateUrl: 'teacher-dashboard/nav',
      controller: function ($scope) {
        var selectedSection = $scope.selectedSection = $scope.section || null;

        $scope.sectionNavigate = function (section) {
          if (section && section.id) {
            $location.path('/sections/' + section.id);
          } else {
            $location.path('/sections');
          }
        };
      }
    };
  }]);

  // FILTERS
  var filters = angular.module('teacherDashboard.filters', [])
    .value('version', '0.1');

  filters.filter('htmlSafe', function ($sce) {
    return function (val) {
        return $sce.trustAsHtml(val);
    };
  });

  // SERVICES

  var services = angular.module('teacherDashboard.services', [])
    .value('version', '0.1');

  // Section service. see sites.v3/code.org/routes/v2_section_routes.rb
  services.factory('sectionsService', ['$resource',
    function ($resource){
      return $resource('/v2/sections/:id', {}, {
      // default methods: see https://code.angularjs.org/1.2.21/docs/api/ngResource/service/$resource
      //  'get':    {method:'GET'},
      //  'save':   {method:'POST'},
      //  'query':  {method:'GET', isArray:true},
      //  'remove': {method:'DELETE'},
      //  'delete': {method:'DELETE'}
         update: {method:'POST', url: 'v2/sections/:id/update'},
         allStudents: {method:'GET', url:'v2/sections/:id/students', isArray: true},
         addStudents: {method:'POST', url:'/v2/sections/:id/students', isArray: true},
         moveStudents: {method:'POST', url:'/dashboardapi/sections/transfers'},
         removeStudent: {method:'DELETE', url:'/v2/sections/:id/students/:studentId'},
         progress: {method:'GET', url:'/dashboardapi/section_progress/:id'},
         studentProgress: {method:'GET', url:'/dashboardapi/student_progress/:id/:studentId'},
         responses: {method:'GET', url:'/dashboardapi/section_text_responses/:id', isArray: true},
         assessments: {method:'GET', url:'/dashboardapi/section_assessments/:id', isArray: true},
         surveys: {method:'GET', url:'/dashboardapi/section_surveys/:id', isArray: true},
      });
    }]).config(['$httpProvider', function ($httpProvider) {
      // X-Requested-With header required for CSRF requests protected by Rack::Protection::JsonCsrf included by Sinatra.
      // Angular originally set this, but removed it in a breaking change in v1.4 because it is "rarely used in practice":
      // https://github.com/angular/angular.js/commit/3a75b1124d062f64093a90b26630938558909e8d
      $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
    }]);

  services.factory('studentsService', ['$resource',
    function ($resource){
      return $resource('/v2/students/:id', {}, {
      // default methods: see https://code.angularjs.org/1.2.21/docs/api/ngResource/service/$resource
      //  'get':    {method:'GET'},
      //  'save':   {method:'POST'},
      //  'query':  {method:'GET', isArray:true},
      //  'remove': {method:'DELETE'},
      //  'delete': {method:'DELETE'}
         update: {method:'POST', url: 'v2/students/:id/update'},
      });
    }]);

  // CONTROLLERS

  var app = angular.module('teacherDashboard.controllers', []);

  app.controller('SectionsController', ['$scope', '$window', 'sectionsService',
      function ($scope, $window, sectionsService) {

    $scope.sectionsLoaded = false;

    $scope.script_list = valid_scripts;
    $scope.assignable_list = valid_assignments;

    $scope.sections = sectionsService.query();

    $scope.sections.$promise.then(sections => {
      $scope.sections.forEach(section => {
        section.assign_id = $scope.getAssignmentId(section);
      });
      $scope.sectionsLoaded = true;
    });

    $scope.moving_students = {editing: true};

    $scope.hocAssignWarningEnabled = hoc_assign_warning;

    $scope.hocCategoryName = i18n.hoc_category_name;

    // Angular does not offer a reliable way to wait for the template to load,
    // so do it using a custom event here.
    $scope.$on('section-page-rendered', () => {
      if (experiments.isEnabled('reactSections')) {
        renderSectionsPage(scriptData);
      }
    });

    /**
     * Given a section, returns the assignment id of the course/script the section
     * is assigned to (or null if not assigned to anything)
     * @param {Section} section - The section we want the assignment id for
     * @returns {string|null}
     */
    $scope.getAssignmentId = function (section) {
      if (section.course_id) {
        return courseAssignmentId(section.course_id);
      }
      if (section.script) {
        return scriptAssignmentId(section.script.id);
      }
      return null;
    };

    /**
     * Given a section, return the name of the course/script the section is
     * assigned to
     * @param {Section} section
     * @returns {string}
     */
    $scope.getName = function (section) {
      const firstMatch = $scope.assignable_list.find(val => val.assign_id == section.assign_id);
      return firstMatch ? firstMatch.name : null;
    };

    /**
     * Given a section, return the a link to the course/script the section is
     * assigned to
     * @param {Section} section
     * @returns {string|null}
     */
    $scope.getPath = function (section) {
      if (section.course_id) {
        const course = valid_courses.find(course => course.id === section.course_id);
        if (!course) {
          // We're assigned a course that's not in our list of valid courses. Don't
          // attempt to provide a link.
          return null;
        }
        return `${studioUrlPrefix}/courses/${course.script_name}`;
      }
      if (section.script) {
        return `${studioUrlPrefix}/s/${section.script.name}`;
      }
      return null;
    };

    $scope.edit = function (section) {
      section.editing = true;
    };

    $scope.genericError = function (result) {
      $window.alert("An unexpected error occurred, please try again. If this keeps happening, try reloading the page.");
    };

    $scope.save = function (section) {
      // Changing our dropdown changes the assign_id. If that assign_id has changed,
      // that indicates we're updating our script/course assigment
      const assignIdChanged = $scope.getAssignmentId(section) !== section.assign_id;
      if (assignIdChanged) {
        const assignable = $scope.assignable_list.find(a => a.assign_id === section.assign_id);
        if ($scope.hocAssignWarningEnabled && assignable.category === $scope.hocCategoryName) {
          $scope.sectionToSave = $scope.sections.indexOf(section);
          $('#assign-confirm').modal('show');
          return;
        }
      }
      $scope.send_save(section);
    };

    $scope.confirm_save = function () {
      $scope.send_save($scope.sections[$scope.sectionToSave]);
      $('#assign-confirm').modal('hide');
    };

    $scope.send_save = function (section) {
      const assignIdChanged = $scope.getAssignmentId(section) !== section.assign_id;
      if (assignIdChanged) {
        const assignable = $scope.assignable_list.find(a => a.assign_id === section.assign_id);
        // update course/script assigned to section. Right now a section can only
        // have one or the other, but that will change in the future.
        section.script = null;
        section.course_id = null;

        if (assignable) {
          if (assignable.is_course) {
            section.course_id = assignable.id;
          } else {
            section.script = {
              id: assignable.id,
              name: assignable.name
            };
          }
        }
      }

      if (section.id) { // update existing
        sectionsService.update({id: section.id}, section).$promise.then(
          function (result_section) {
            result_section.assign_id = $scope.getAssignmentId(result_section);
            $scope.sections[$scope.sections.indexOf(section)] = result_section;
          }
        ).catch($scope.genericError);
      } else { // save new
        sectionsService.save(section).$promise.then(
          function (result_section) {
            result_section.assign_id = $scope.getAssignmentId(result_section);
            $scope.sections[$scope.sections.indexOf(section)] = result_section;
          }
        ).catch($scope.genericError);
      }
    };

    $scope.confirm_delete = function (section) {
      section.confirmDelete = true;
    };

    $scope.del = function (section) {
      sectionsService.remove(section).$promise.then(
        function () {
          $scope.sections.splice($scope.sections.indexOf(section), 1); // remove from array
          section.confirmDelete = false;
        }
      ).catch(
        function () { $window.alert("An unexpected error occurred, please try again. If this keeps happening, try reloading the page."); }
      );
    };

    $scope.cancel = function (section) {
      if (section.id) {
        section.editing = false;
      } else {
        $scope.sections.splice($scope.sections.indexOf(section), 1); // remove from array
      }
    };

    $scope.new_section = function () {
      $scope.sections.unshift({editing: true, login_type: 'word', pairing_allowed: true});
    };
  }]);

  app.controller('StudentDetailController', ['$scope', '$routeParams', 'sectionsService',
                                             function ($scope, $routeParams, sectionsService) {
    $scope.section = sectionsService.get({id: $routeParams.sectionid});

    $scope.script_id = parseInt($routeParams.scriptid);
    $scope.script_list = valid_scripts;

    $scope.progress = sectionsService.studentProgress({id: $routeParams.sectionid, studentId: $routeParams.studentid});

    $scope.changeProgress = function () {
      $scope.progress = sectionsService.studentProgress({id: $routeParams.sectionid, studentId: $routeParams.studentid, script_id: $scope.script_id});
    };
  }]);

  app.controller('SectionDetailController', ['$scope', '$routeParams', '$window', '$q', '$location', 'sectionsService', 'studentsService',
                                             function ($scope, $routeParams, $window, $q, $location, sectionsService, studentsService) {


    $scope.section = sectionsService.get({id: $routeParams.id});
    $scope.sections = sectionsService.query();

    // error handling
    $scope.genericError = function (result) {
      $window.alert("An unexpected error occurred, please try again. If this keeps happening, try reloading the page.");
    };

    $scope.section.$promise.catch(function (result) {
      if (result.status == 403 || result.status == 404) {
        $window.alert("You are not the owner of this section or this section doesn’t exist.");
      } else {
        $scope.genericError(result);
      }
    });
    $scope.sections.$promise.catch($scope.genericError);

    $scope.tab = $routeParams.tab;

    $scope.section.$promise.then(
      function ( section ){
        if (!$scope.tab) {
          if ($scope.section.students.length > 0) {
            $location.path('/sections/' + $routeParams.id + '/progress');
          } else {
            $location.path('/sections/' + $routeParams.id + '/manage');
          }
        }
      }
    );


    // the ng-select in the nav compares by reference not by value, so we can't just set
    // selectedSection to section, we have to find it in sections.
    $scope.sections.$promise.then(
      function ( sections ){
        $scope.selectedSection = $.grep(sections, function (section) { return (section.id == $routeParams.id);})[0];
      }
    );

    $scope.age_list = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, "21+"];

    $scope.gender_list = {f: i18n.dashboard_students_female, m: i18n.dashboard_students_male};

    $scope.bulk_import = {editing: false, students: ''};

    $scope.edit = function (student) {
      student.editing = true;
    };

    $scope.resetSecrets = function (student) {
      var newStudent = studentsService.update({id: student.id}, {secrets: 'reset'});
      newStudent.$promise.then(
        function (student) {
          student.showing_password = true;
        }
      );

      newStudent.$promise.catch($scope.genericError);
      $scope.section.students[$scope.section.students.indexOf(student)] = newStudent;
    };

    $scope.save = function (students) {
      if (!$.isArray(students)) {
        return $scope.save([students]); // heh
      }

      var newStudents = [];
      var modifiedStudents = [];

      $.each(students, function (index, student) {
        if (student.editing || student.editing_password) {
          if (student.id) {
            modifiedStudents.push(student);
          } else {
            newStudents.push(student);
          }
        }
      });

      // create new students
      if (newStudents && newStudents.length > 0) {
        // remove 'new' students from array
        $.each(newStudents, function (index, student) {
          $scope.section.students.splice($scope.section.students.indexOf(student), 1);
        });

        // add the results from the service to the array
        sectionsService.addStudents({id: $scope.section.id}, newStudents, function (resultStudents) {
          $.each(resultStudents, function (index, student) {
            $scope.section.students.unshift(student);
          });
        }).$promise.catch($scope.genericError);
      }

      // update existing students
      $.each(modifiedStudents, function (index, student) {
        studentsService.update({id: student.id}, student).$promise.then(
          function (result_student) {
            result_student.editing = false;
            $scope.section.students[$scope.section.students.indexOf(student)] = result_student;
          }
        ).catch($scope.genericError);
      });
   };

   $scope.confirm_delete = function (student) {
     student.confirmDelete = true;
   };

    $scope.del = function (student) { // note -- IE doesn't like it when you name things 'delete'
      sectionsService.removeStudent({id: $scope.section.id, studentId: student.id}).$promise.then(
        function () {
          $scope.section.students.splice($scope.section.students.indexOf(student), 1); // remove from array
        }
      ).catch($scope.genericError);
    };

    $scope.cancel = function (student) {
      if (student.id) {
        student.editing = false;
      } else {
        $scope.section.students.splice($scope.section.students.indexOf(student), 1); // remove from array
      }
    };

    $scope.new_student = function () {
      $scope.section.students.unshift({editing: true});
    };

    $scope.showMoveStudentsModal = function () {
      $('#move-students').modal('show');
    };

    $scope.clear_bulk_import = function () {
      $scope.bulk_import.editing = false;
      $scope.bulk_import.students = '';
    };

    $scope.add_bulk_import = function () {
      var student_names = $scope.bulk_import.students.split("\n");
      for (var i = 0; i < student_names.length; i++) {
        var student_name = student_names[i];
        student_name = student_name.trim();
        if (student_name.length > 0) {
          $scope.section.students.unshift({editing: true, name: student_name});
        }
      }
      $scope.clear_bulk_import();
    };

    $scope.editingAny = function (things) {
      if (!things) {
        return false;
      }
      for (var i = 0; i < things.length; i++) {
        if (things[i].editing) {
          return true;
        }
      }
      return false;
    };

    $scope.editingAll = function (things) {
      if (!things) {
        return false;
      }
      for (var i = 0; i < things.length; i++) {
        if (!things[i].editing) {
          return false;
        }
      }
      return true;
    };

    $scope.print = function () {
      $window.print();
    };

  }]);

  app.controller('MovingStudentsController', ['$route', '$scope', '$routeParams', '$q', '$window', '$http', 'sectionsService', function ($route, $scope, $routeParams, $q, $window, $http, sectionsService) {
    var self = this;

    // 'Other Section' selected
    $scope.otherTeacher = 'Other Teacher';
    $scope.stayEnrolledInCurrentSection = 'true';

    // Query
    $scope.currentSection = sectionsService.get({id: $routeParams.id});
    $scope.sections = sectionsService.query();
    $scope.students = sectionsService.allStudents({id: $routeParams.id});

    $scope.moveStudents = function () {
      function isOwnSection(sectionCode) {
        return $scope.sections.some(function (section) {return section.code === sectionCode;});
      }

      function displayError(errorMessage) {
        $('.move-students-error').text(errorMessage);
      }

      var params = {};
      params['new_section_code'] = $scope.getNewSectionCode();
      params['current_section_code'] = $scope.getCurrentSectionCode();
      params['student_ids'] = $scope.getSelectedStudentIds().join(',');
      params['stay_enrolled_in_current_section'] = $scope.getStayEnrolledInCurrentSection();

      if (!params['student_ids']) {
        displayError(error_string_none_selected);
      } else if (isOwnSection($scope.manuallySelectedSectionCode)) {
        displayError(error_string_other_section);
      } else {
        sectionsService.moveStudents(params, {}).$promise.then(
          function success(response) {
            $('#move-students').modal('hide');
            $route.reload();
          },
          function error(response) {
            $('.move-students-error').text(response.data["error"]);
          });
      }
    };

    $scope.showModal = function () {
      $q.all([$scope.currentSection.$promise, $scope.students.$promise]).then(function () {
        $('#move-students').modal('show');
      });
    };

    $scope.checkAll = function () {
      $scope.selectedAll = !$scope.selectedAll;
      angular.forEach($scope.students, function (student) {
        student.selected = $scope.selectedAll;
      });
    };

    $scope.getCurrentSectionCode = function () {
      return $scope.section.code;
    };

    $scope.getSelectedStudentIds = function () {
      var student_ids = [];
      angular.forEach($scope.students, function (student) {
        if (student.selected) {
          student_ids.push(student.id);
        }
      });

      return student_ids;
    };

    $scope.getNewSectionCode = function () {
      if ($scope.selectedSectionCode !== $scope.otherTeacher) {
        return $scope.selectedSectionCode;
      } else {
        return $scope.manuallySelectedSectionCode;
      }
    };

    $scope.getStayEnrolledInCurrentSection = function () {
      if ($scope.selectedSectionCode == $scope.otherTeacher) {
        return $scope.stayEnrolledInCurrentSection;
      } else {
        return false;
      }
    };
  }]);

  app.controller('SectionSigninCardsController', ['$scope', '$routeParams', '$window', '$q', 'sectionsService',
                                             function ($scope, $routeParams, $window, $q, sectionsService) {

    $scope.section = sectionsService.get({id: $routeParams.id});
    $scope.sections = sectionsService.query();

    // error handling
    $scope.genericError = function (result) {
      $window.alert("An unexpected error occurred, please try again. If this keeps happening, try reloading the page.");
    };
    $scope.section.$promise.catch($scope.genericError);
    $scope.sections.$promise.catch($scope.genericError);

    // the ng-select in the nav compares by reference not by value, so we can't just set
    // selectedSection to section, we have to find it in sections.
    $scope.sections.$promise.then(
      function ( sections ){
        $scope.selectedSection = $.grep(sections, function (section) { return (section.id == $routeParams.id);})[0];
      }
    );

    $scope.print = function () {
      $window.print();
    };

  }]);

  app.controller('SectionProjectsController', ['$scope', '$routeParams', 'sectionsService',
      function ($scope, $routeParams,  sectionsService) {
    $scope.sections = sectionsService.query();
    $scope.section = sectionsService.get({id: $routeParams.id});
    $scope.tab = 'projects';

    // Angular does not offer a reliable way to wait for the template to load,
    // so do it using a custom event here. The call to listen for the custom
    // event must not be nested inside another deferred call or we might
    // miss the event.
    $scope.$on('section-projects-rendered', function () {
      $scope.section.$promise.then(
        function (section) {
          renderSectionProjects(section.id);
        }
      );
    });

    // the ng-select in the nav compares by reference not by value, so we can't just set
    // selectedSection to section, we have to find it in sections.
    $scope.sections.$promise.then(
      function (sections) {
        $scope.selectedSection = $.grep(sections, function (section) {
          return (section.id == $routeParams.id);
        })[0];
      }
    );
  }]);

  app.controller('SectionProgressController', ['$scope', '$routeParams', '$window', '$q', '$timeout', '$interval', 'sectionsService', 'studentsService',
                                             function ($scope, $routeParams, $window, $q, $timeout, $interval, sectionsService, studentsService) {
    $scope.section = sectionsService.get({id: $routeParams.id});
    $scope.sections = sectionsService.query();
    $scope.progress = sectionsService.progress({id: $routeParams.id});
    $scope.tab = 'progress';
    $scope.page = {zoom: false};

    // error handling
    $scope.genericError = function (result) {
      $window.alert("An unexpected error occurred, please try again. If this keeps happening, try reloading the page.");
    };
    $scope.section.$promise.catch($scope.genericError);
    $scope.sections.$promise.catch($scope.genericError);
    $scope.progress.$promise.catch($scope.genericError);

    // the ng-select in the nav compares by reference not by value, so we can't just set
    // selectedSection to section, we have to find it in sections.
    $scope.sections.$promise.then(
      function ( sections ){
        $scope.selectedSection = $.grep(sections, function (section) { return (section.id == $routeParams.id);})[0];
      }
    );

    $scope.progressLoadedFirst = false;
    $scope.progressLoaded = false;

    $scope.script_list = valid_scripts;
    $scope.progress_disabled_scripts = disabled_scripts;

    // wait until we have both the students and the student progress
    $q.all([$scope.progress.$promise, $scope.section.$promise]).then(function (){
      $scope.mergeProgress();
      $scope.progressLoadedFirst = true;
      $scope.progressLoaded = true;
    });

    $scope.changeProgress = function (scriptId) {
      $scope.progressLoadedFirst = false;
      // $scope.progressLoaded = false;

      // TODO: The hide/show behavior that uses progressLoaded is
      // broken on Chrome 45. I am not sure why, but the hide/show
      // behavior that uses progressLoadedFirst works fine, so switching
      // to using that is a good rough fix. This changes the behavior so
      // that the entire table disappears and reappears instead of just
      // the progress bar when using the course dropdown.

      $scope.progress = sectionsService.progress({id: $routeParams.id, script_id: scriptId});

      $scope.progress.$promise.then(function (){
        $scope.mergeProgress();
        $scope.progressLoadedFirst = true;
        $scope.progressLoaded = true;
      });
    };

    $scope.progressWidth = function () {
      return $scope.page.zoom ? Math.max(34 * $scope.progress.script.levels_count, 770) : 770;
    };

    // refresh progress every 30s
    // TODO: 'update' progress instead of replacing it
    //$interval(function() {
    //  if (!$scope.progressLoaded) { return; } // don't refresh if loading
    //   $scope.progressLoaded = false;
    //   if ($scope.scriptId) {
    //     $scope.progress = sectionsService.progress({id: $routeParams.id, script_id: $scope.scriptId});
    //   } else {
    //     $scope.progress = sectionsService.progress({id: $routeParams.id});
    //   }
    //   $q.all([$scope.progress.$promise, $scope.section.$promise]).then(function(data){
    //     $scope.mergeProgress();
    //     $scope.progressLoaded = true;
    //   });
    // }, 30 * 1000);

    $scope.scrollToStage = function ($event){
      var doScroll = function () {
        var element = $( $event.currentTarget );
        var wrapper = $('.table-wrapper');
        var LEFT_COLUMN_WIDTH = 200; // scrolling the entire table not just this col, so we have to know about the left col width
        var LEFT_OFFSET = 20; // a little offset so we can see the previous stage
        wrapper.animate({scrollLeft: (element.position().left - wrapper.position().left + wrapper.scrollLeft() - LEFT_COLUMN_WIDTH - LEFT_OFFSET)}, 500);
      };

      if ($scope.page.zoom) {
        doScroll();
      } else {
        // if we weren't already zoomed we need to zoom and then wait for the zoom to finish
        $scope.page.zoom = true;
        $timeout(doScroll, 500);
      }
    };

    var isInCategory = function (script_list, script_id, categoryName) {
      for (var i = 0; i < script_list.length; i++) {
        if (script_list[i].id === script_id) {
          return categoryName === script_list[i].category;
        }
      }
      return false;
    };

    // merge the data returned by progress api into the data returned by the section students api
    $scope.mergeProgress = function () {
      $scope.script_id = $scope.progress.script.id;
      $scope.progress_disabled = $scope.progress_disabled_scripts.indexOf($scope.script_id) !== -1;
      var hocCategoryName = i18n.hoc_category_name;
      $scope.is_hoc_course = isInCategory($scope.script_list, $scope.script_id, hocCategoryName);
      // calculate width of each level in the progress bar assuming the overall width is 780 px

      // Takes the level's position in the script, and returns its level number in its stage
      var getLevelNumberInStage = function (overallLevel) {
        for (var i = 0; i < $scope.progress.script.stages.length; i++) {
          var stage = $scope.progress.script.stages[i];
          if (overallLevel < stage.length)            {return overallLevel + 1;}          else            {overallLevel -= stage.length;}
        }
        return 0;
      };

      // Put levels on the student object
      for (var i = 0; i < $scope.section.students.length; i++) {
        var student = $scope.section.students[i];

        // default is no progress
        student.levels = [];
        student.highest_level = -1; // not started yet
        student.highest_level_in_stage = 0;

        // if we have progress
        var progress_student = $.grep($scope.progress.students, function (e){ return e.id == student.id; })[0];
        if (progress_student) {
          student.levels = progress_student.levels;

          // find the last level attempted
          for (var l = student.levels.length - 1; l >= 0; l--) {
            if (student.levels[l] && student.levels[l].class != 'not_tried') {
              var delayedSetHighestLevel = function (student, l) {
                student.highest_level = l;
                student.highest_level_in_stage = getLevelNumberInStage(l);
              };
              $timeout(delayedSetHighestLevel.bind(this, student, l), 500); // add a delay so we get animation
              break;
            }
          }
        }
      }
    };
  }]);

  app.controller('SectionResponsesController', ['$scope', '$routeParams', '$window', '$q', '$timeout', '$interval', '$sanitize', 'sectionsService', 'studentsService',
                                             function ($scope, $routeParams, $window, $q, $timeout, $interval, $sanitize, sectionsService, studentsService) {
    $scope.section = sectionsService.get({id: $routeParams.id});
    $scope.sections = sectionsService.query();
    $scope.tab = 'responses';

    $scope.responses = sectionsService.responses({id: $routeParams.id});
    // error handling
    $scope.genericError = function (result) {
      $window.alert("An unexpected error occurred, please try again. If this keeps happening, try reloading the page.");
    };
    $scope.section.$promise.catch($scope.genericError);
    $scope.sections.$promise.catch($scope.genericError);
    $scope.responses.$promise.catch($scope.genericError);

    // fill in the course dropdown with the section's default course
    $scope.section.$promise.then(
      function (section) {
        // TODO:(bjvanminnen) - also handle case where we have a course, but not
        // a script assigned, likely by figuring out the first script in that course
        if (section.script) {
          $scope.script_id = section.script.id;
        }
      }
    );

    // the ng-select in the nav compares by reference not by value, so we can't just set
    // selectedSection to section, we have to find it in sections.
    $scope.sections.$promise.then(
      function ( sections ){
        $scope.selectedSection = $.grep(sections, function (section) { return (section.id == $routeParams.id);})[0];
      }
    );

    $scope.responsesLoaded = false;
    $scope.stages = [];

    $scope.script_list = valid_scripts;

    // wait until we have both the students and the student progress
    $q.all([$scope.section.$promise, $scope.responses.$promise]).then(function (){
      $scope.responsesLoaded = true;
      $scope.findStages();
    });

    $scope.changeScript = function (scriptId) {
      $scope.responsesLoaded = false;
      $scope.stages = [];

      $scope.responses = sectionsService.responses({id: $routeParams.id, script_id: scriptId});

      $scope.responses.$promise.then(function (){
        $scope.responsesLoaded = true;
        $scope.findStages();
      });
    };

    $scope.findStages = function () {
      $scope.stages = $.map($scope.responses, function (row) {
        return row.stage;
      }).filter(function (item, i, array) { // uniquify
        return array.indexOf(item) == i;
      });
    };
  }]);


  app.controller('SectionAssessmentsController', ['$scope', '$routeParams', '$window', '$q', '$timeout', '$interval', '$sanitize', 'sectionsService', 'studentsService',
                                             function ($scope, $routeParams, $window, $q, $timeout, $interval, $sanitize, sectionsService, studentsService) {
    // Some strings.
    var submission_list = {
      submitted:   i18n.dashboard_submission_submitted,
      in_progress: i18n.dashboard_submission_in_progress,
    };

    var correctness_list = {
      free_response: i18n.dashboard_correctness_free_response,
      unsubmitted:   i18n.dashboard_correctness_unsubmitted,
      correct:       i18n.dashboard_correctness_correct,
      incorrect:     i18n.dashboard_correctness_incorrect,
    };

    // Initial requests.
    $scope.section = sectionsService.get({id: $routeParams.id});
    $scope.sections = sectionsService.query();
    $scope.tab = 'assessments';

    $scope.script_list = valid_scripts;

    $scope.assessmentsLoaded = false;
    $scope.assessmentStages = [];
    $scope.assessments = sectionsService.assessments({id: $routeParams.id});

    $scope.surveysLoaded = false;
    $scope.surveyStages = [];
    $scope.surveys = sectionsService.surveys({id: $routeParams.id});

    // Error handling.
    $scope.genericError = function (result) {
      $window.alert("An unexpected error occurred, please try again. If this keeps happening, try reloading the page.");
    };
    $scope.section.$promise.catch($scope.genericError);
    $scope.sections.$promise.catch($scope.genericError);
    $scope.assessments.$promise.catch($scope.genericError);

    // Fill in the course dropdown with the section's default script.
    $scope.section.$promise.then(
      function (section) {
        $scope.scriptid = section.script.id;
      }
    );

    // The ng-select in the nav compares by reference not by value, so we can't just set
    // selectedSection to section, we have to find it in sections.
    $scope.sections.$promise.then(
      function ( sections ){
        $scope.selectedSection = $.grep(sections, function (section) { return (section.id == $routeParams.id);})[0];
      }
    );

    // Wait until we have initial section, assessment, and survey data.
    $q.all([$scope.section.$promise, $scope.assessments.$promise, $scope.surveys.$promise]).then(function (){
      $scope.assessmentsLoaded = true;
      $scope.surveysLoaded = true;
      $scope.assessmentLevels = $scope.getAssessmentData($scope.assessments);
      $scope.assessmentStages = $scope.findStages($scope.assessments);
      $scope.surveyLevels = $scope.getSurveyData($scope.surveys);
      $scope.surveyStages = $scope.findStages($scope.surveys);
    });

    // Re-retrieve assessment and survey data when the script is changed using the dropdown.
    $scope.changeScript = function (scriptId) {

      // Load assessments.
      $scope.assessmentsLoaded = false;
      $scope.assessments = sectionsService.assessments({id: $routeParams.id, script_id: scriptId});
      $scope.assessments.$promise.then(function (){
        $scope.assessmentsLoaded = true;
        $scope.assessmentLevels = $scope.getAssessmentData($scope.assessments);
        $scope.assessmentStages = $scope.findStages($scope.assessments);
      });

      // Load surveys.
      $scope.surveysLoaded = false;
      $scope.surveys = sectionsService.surveys({id: $routeParams.id, script_id: scriptId});
      $scope.surveys.$promise.then(function () {
        $scope.surveysLoaded = true;
        $scope.surveyStages = $scope.findStages($scope.surveys);
        $scope.surveyLevels = $scope.getSurveyData($scope.surveys);
      });
    };

    $scope.findStages = function (source) {
      return $.map(source, function (row) {
        return row.stage;
      }).filter(function (item, i, array) { // uniquify
        return array.indexOf(item) == i;
      });
    };

    $scope.getAssessmentData = function (assessments) {
      var results = [];

      $.each(assessments, function (index, assessment) {

        if (assessment.multi_count === 0) {
          assessment.multi_correct_percent = 0;
        } else {
          assessment.multi_correct_percent = assessment.multi_correct / assessment.multi_count * 100;
        }
        assessment.status = assessment.submitted ? submission_list.submitted : submission_list.in_progress;

        // Don't show a timestamp for non-submittted assessments.
        if (!assessment.submitted) {
          assessment.timestamp = null;
        }

        // Each LevelGroup's result has a list of the results for the levels in that order.
        // Because angular's nested iterators are kind of funky when trying to generate a table,
        // let's just generate a flat list of the level results to go into $scope.
        $.each(assessment.level_results, function (index, level_result) {
          var levelResult = {
            stage: assessment.stage,
            puzzle: assessment.puzzle,
            question: index + 1,
            student: assessment.student,
            studentResult: level_result.student_result,
            correct: correctness_list[level_result.correct]
          };
          results.push(levelResult);
        });
      });

      return results;
    };

    $scope.getSurveyData = function (surveys) {
      // The ASCII value of A.  Used for rendering multiple choice captions.
      var asciiForA = 65;

      var surveyResults = [];

      $.each($scope.surveys, function (surveyIndex, survey) {

        survey.status = survey.submitted ? submission_list.submitted : submission_list.in_progress;

        if (survey.levelgroup_results) {

          // Each LevelGroup's result has a list of the results for the levels in that order.
          // Because angular's nested iterators are kind of funky when trying to generate a table,
          // let's just generate a flat list of the level results to go into $scope.
          $.each(survey.levelgroup_results, function (sublevelIndex, sublevelResults) {
            var questionText = sublevelResults.question;

            // How many students answered this question?
            var resultsLength = sublevelResults.results.length;

            if (sublevelResults.type == "free_response") {
              // Free response: just add all of the responses.
              $.each(sublevelResults.results, function (sublevelResultIndex, sublevelResult) {
                // Disambiguate free responses that are unsubmitted and that are empty strings.
                if (sublevelResult.result === undefined || sublevelResult.result === "") {
                  sublevelResult.result = null;
                }

                var questionFieldText = (parseInt(sublevelIndex) + 1) + (questionText ? ". " + questionText : "");
                var resultFieldText = sublevelResult.result;

                // Only create separate rows for answers which have a result to show.
                if (resultFieldText !== null) {
                  var levelResult = {
                    stage: survey.stage,
                    question: parseInt(sublevelIndex) + 1,
                    questionText: questionFieldText,
                    resultText: resultFieldText,
                    count: 1
                  };

                  surveyResults.push(levelResult);
                }
              });

            } else if (sublevelResults.type == "multi") {
              // Multi: go through each answer and work out how many responses had that answer.

              // Store one result per possible answer.
              var multiResults = [];

              // First, build a result entry for each possible answer.
              $.each(sublevelResults.answer_texts, function (answerTextIndex, answerText) {
                var questionFieldText = (parseInt(sublevelIndex) + 1) + (questionText ? ". " + questionText : "");
                var answerFieldText = String.fromCharCode(asciiForA + answerTextIndex) + ". " + answerText;

                var levelResult = {
                  stage: survey.stage,
                  question: parseInt(sublevelIndex) + 1,
                  questionText: questionFieldText,
                  resultText: answerFieldText,
                  count: 0,
                  percent: "0%"
                };

                multiResults[answerTextIndex] = levelResult;
              });

              // Second, go through each result and update the count for that result.
              $.each(sublevelResults.results, function (sublevelResultIndex, sublevelResult) {
                if ("answer_index" in sublevelResult) {
                  var answerIndex = sublevelResult.answer_index;
                  multiResults[answerIndex].count ++;
                  multiResults[answerIndex].percent =
                    (Math.round(multiResults[answerIndex].count / resultsLength * 100)) + "%";
                }
              });

              surveyResults = surveyResults.concat(multiResults);
            }
          });
        }
      });

      // Sort by stage, question, result text.
      surveyResults.sort(function (a, b) {
        if (a.stage !== b.stage) {
          return a.stage.localeCompare(b.stage);
        } else if (a.question !== b.question) {
          return a.question - b.question;
        } else {
          return a.resultText.localeCompare(b.resultText);
        }
      });

      return surveyResults;
    };
  }]);

}
