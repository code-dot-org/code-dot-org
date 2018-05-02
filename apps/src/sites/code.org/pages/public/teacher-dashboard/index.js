/* global angular */

/**
 * Entry point for teacher-dashboard/index.js bundle
 */

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { registerReducers, getStore } from '@cdo/apps/redux';
import SectionProjectsList from '@cdo/apps/templates/projects/SectionProjectsList';
import SectionProgress from '@cdo/apps/templates/sectionProgress/SectionProgress';
import experiments from '@cdo/apps/util/experiments';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {
  renderSyncOauthSectionControl,
  unmountSyncOauthSectionControl,
  renderLoginTypeControls,
  unmountLoginTypeControls,
  renderSectionTable,
} from '@cdo/apps/templates/teacherDashboard/sections';
import logToCloud from '@cdo/apps/logToCloud';
import sectionProgress, {setSection, setValidScripts} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';

const script = document.querySelector('script[data-teacherdashboard]');
const scriptData = JSON.parse(script.dataset.teacherdashboard);

main(scriptData);

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
        showProjectThumbnails={true}
      />,
      element);
  });
}

function renderSectionProgress(section, validScripts) {
  registerReducers({sectionProgress});
  const store = getStore();
  store.dispatch(setSection(section));
  store.dispatch(setValidScripts(validScripts));

  ReactDOM.render(
    <Provider store={store}>
      <SectionProgress />
    </Provider>,
    document.getElementById('section-progress-react')
  );
}

//  Everything below was copied wholesale from index.haml, where we had no linting.
// TODO (bjvanminnen): Fix remaining lint errors and re-enable rules.
/* eslint-disable eqeqeq, no-unused-vars */
function main() {
  const studioUrlPrefix = scriptData.studiourlprefix;
  var valid_scripts = scriptData.valid_scripts;
  var disabled_scripts = scriptData.disabled_scripts;
  var i18n = scriptData.i18n;
  var error_string_none_selected = i18n.error_string_none_selected;
  var error_string_other_section = i18n.error_string_other_section;

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
    function ($resource) {
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
      $httpProvider.defaults.cache = true;
    }]);

  services.factory('studentsService', ['$resource',
    function ($resource) {
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

  // For large sections, we're having requests time out before we hear back from
  // the server. Instead, lets ask for progress for only N students at a time,
  // and populate our table once we have all data. This is a quick and dirty approach
  // that may not be the best way to accomplish this in angular, but we expect it
  // to be replaced within the next couple of sprints as we move this to React.
  services.factory('paginatedSectionProgressService', ['$http', '$q',
    function ($http, $q) {
      function reinflateDate(data, sectionId) {
        // We try to minimize how much data we send back to the client, as this can
        // grow large with big sections. This means some additional processing to
        // get the data back in a form that we'd like
        return {
          ...data,
          students: data.students.map(student => ({
            ...student,
            levels: student.levels.map(([className, title, url]) => ({
              class: className,
              title,
              url: studioUrlPrefix + url + `?section_id=${sectionId}&user_id=${student.id}`
            }))
          }))
        };
      }

      return {
        get: (id, script_id=undefined) => {
          const deferred = $q.defer();

          let data;
          let page = 1;
          let pageSize = 50;

          const getNextPage = () => {
            let queryParams = `page=${page}&per=${pageSize}`;
            if (script_id) {
              queryParams += `&script_id=${script_id}`;
            }
            return $http.get(`/dashboardapi/section_progress/${id}?${queryParams}`)
            .then(pageSuccess, pageFailure);
          };

          const pageSuccess = result => {
            if (!data) {
              data = result.data;
            } else {
              // append student data
              data.students.push(...result.data.students);
            }
            // resolve once we've received our last page
            if (result.data.students.length < pageSize) {
              deferred.resolve(reinflateDate(data, id));
            } else {
              page++;
              getNextPage();
            }
          };

          const pageFailure = err => {
            deferred.reject(err);
          };

          // Query the server for the next page, any time we get a full page
          // worth of results, assume there are more and ask for the next page.
          // Once we get a non-full page, resolve our promise with the concatenated
          // data
          getNextPage();

          // return our promise
          return deferred.promise;
        }
      };
    }
  ]);


  // CONTROLLERS

  var app = angular.module('teacherDashboard.controllers', []);

  app.controller('SectionsController', ['$scope', '$window', 'sectionsService',
      function ($scope, $window, sectionsService) {
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard-tabbing',
        event: 'SectionsController'
      }
    );
    // The sections page has been removed, so redirect to the teacher homepage
    // which now contains section controls.
    // TODO: Tear out this whole controller when we're sure nothing links to
    //       the sections page anymore.
    logToCloud.addPageAction(logToCloud.PageAction.PegasusSectionsRedirect, {});
    window.location = scriptData.studiourlprefix + '/home';
  }]);

  app.controller('StudentDetailController', ['$scope', '$routeParams', 'sectionsService',
                                             function ($scope, $routeParams, sectionsService) {
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard-tabbing',
        event: 'StudentDetailController'
      }
    );

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
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard-tabbing',
        event: 'SectionDetailController'
      }
    );

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
      function ( section ) {
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
      function ( sections ) {
        $scope.selectedSection = $.grep(sections, function (section) { return (section.id == $routeParams.id);})[0];
      }
    );

    $scope.teacher_managed_section = function (section) {
      return ['email', 'word', 'picture'].includes(section.login_type);
    };

    $scope.age_list = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, "21+"];

    $scope.gender_list = {f: i18n.dashboard_students_female, m: i18n.dashboard_students_male};

    $scope.bulk_import = {editing: false, students: ''};

    if ($scope.tab === 'stats') {
      $scope.$on('stats-table-rendered', () => {
        firehoseClient.putRecord(
          {
            study: 'teacher-dashboard',
            study_group: 'control',
            event: 'stats'
          }
        );
      });
    }

    if ($scope.tab === 'manage') {
      $scope.$on('react-sync-oauth-section-rendered', () => {
        $scope.section.$promise.then(section =>
          renderSyncOauthSectionControl({
            sectionId: section.id,
            provider: scriptData.provider
          })
        );
      });

      $scope.$on('login-type-react-rendered', () => {
        $scope.section.$promise.then(section => renderLoginTypeControls(section.id));
      });

      $scope.$on('student-table-react-rendered', () => {
        $scope.section.$promise.then(section => renderSectionTable(section.id, section.login_type, section.course_name));
        firehoseClient.putRecord(
          {
            study: 'teacher-dashboard',
            study_group: 'control',
            event: 'manage'
          }
        );
      });

      $scope.$on('$destroy', () => {
        unmountSyncOauthSectionControl();
        unmountLoginTypeControls();
      });
    }

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
        }).$promise.then(() => {
          // If we started with zero students, we need to rerender login type
          // controls so the correct options are available.
          // Because 'temporary' students are included in $scope.section.students
          // before we reach this save() action, if _all_ students are new
          // students then we had zero saved students to begin with.
          // TODO: Once everything is React this should become unnecessary.
          if (newStudents.length === $scope.section.students.length) {
            unmountLoginTypeControls();
            renderLoginTypeControls($scope.section.id);
          }
        }).catch($scope.genericError);
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
      ).then(() => {
        // If we removed the last student, rerender login type controls so
        // the correct options are available.
        // TODO: Once everything is React this should become unnecessary.
        if ($scope.section.students.length <= 0) {
          unmountLoginTypeControls();
          renderLoginTypeControls($scope.section.id);
        }
      }).catch($scope.genericError);
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
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard-tabbing',
        event: 'MovingStudentsController'
      }
    );

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
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard-tabbing',
        event: 'SectionSigninCardsController'
      }
    );

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
      function ( sections ) {
        $scope.selectedSection = $.grep(sections, function (section) { return (section.id == $routeParams.id);})[0];
      }
    );

    $scope.print = function () {
      const content = document.getElementsByClassName('all_cards')[0].innerHTML;
      $window.frames.print_frame.document.body.innerHTML = content;

      //Want to apply this only to the printing frame, so add here rather than inline
      const cards = $window.frames.print_frame.document.getElementsByClassName('signin_card');
      for (let i = 0; i < cards.length; i++) {
        cards[i].style.width = '300px';
      }
      $window.frames.print_frame.window.focus();
      $window.frames.print_frame.window.print();
    };

  }]);

  app.controller('SectionProjectsController', ['$scope', '$routeParams', 'sectionsService',
      function ($scope, $routeParams,  sectionsService) {
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard-tabbing',
        event: 'SectionProjectsController'
      }
    );
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: 'control',
        event: 'projects'
      }
    );

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

  app.controller('SectionProgressController', ['$scope', '$routeParams', '$window', '$q', '$timeout', '$interval', 'sectionsService', 'studentsService', 'paginatedSectionProgressService',
                                             function ($scope, $routeParams, $window, $q, $timeout, $interval, sectionsService, studentsService, paginatedSectionProgressService) {
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard-tabbing',
        event: 'SectionProgressController'
      }
    );

    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: 'control',
        event: 'progress-summary'
      }
    );

    $scope.tab = 'progress';
    $scope.page = {zoom: false};
    $scope.react_progress = false;

    // We want to make our sections service request whether using react or angular
    // because our tabs haml (in nav.haml) depends on the section being loaded. It
    // could probably be cleaned up to behave differently without too much difficulty,
    // which would make this unnecessary.
    $scope.section = sectionsService.get({id: $routeParams.id});
    // sections is used by our section dropdown, which at least initially will
    // still be in angular
    $scope.sections = sectionsService.query();

    // error handling
    $scope.genericError = function (result) {
      $window.alert("An unexpected error occurred, please try again. If this keeps happening, try reloading the page.");
    };
    $scope.section.$promise.catch($scope.genericError);
    $scope.sections.$promise.catch($scope.genericError);

    // the ng-select in the nav compares by reference not by value, so we can't just set
    // selectedSection to section, we have to find it in sections.
    $scope.sections.$promise.then(sections => {
      $scope.selectedSection = sections.find(section => section.id.toString() === $routeParams.id);
    });

    // Logs the request for detailed progress and sets the zoom state
    $scope.progressDetailRequest = function () {
      $scope.page = {zoom: true};
      firehoseClient.putRecord(
        {
          study: 'teacher-dashboard',
          study_group: 'control',
          event: 'progress-detailed'
        }
      );
    };

    // Logs the request for summarized progress view and sets the zoom state
    $scope.progressSummaryRequest = function () {
      $scope.page = {zoom: false};
      firehoseClient.putRecord(
        {
          study: 'teacher-dashboard',
          study_group: 'control',
          event: 'progress-summary'
        }
      );
    };

    if (experiments.isEnabled('sectionProgressRedesign')) {
      $scope.react_progress = true;
      $scope.$on('section-progress-rendered', () => {
        $scope.section.$promise.then(script =>
          renderSectionProgress(script, valid_scripts)
        );
      });
      return;
    }

    // The below is not run if our sectionProgressRedesign experiment is not enabled

    const paginatedPromise = paginatedSectionProgressService.get($routeParams.id)
      .then(result => {
        $scope.progress = result;
      })
      .catch($scope.genericError);

    $scope.progressLoadedFirst = false;
    $scope.progressLoaded = false;

    $scope.script_list = valid_scripts;
    $scope.progress_disabled_scripts = disabled_scripts;

    // wait until we have both the students and the student progress
    $q.all([paginatedPromise, $scope.section.$promise]).then(function () {
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

      paginatedSectionProgressService.get($routeParams.id, scriptId)
        .then(result => {
          $scope.progress = result;
          $scope.mergeProgress();
          $scope.progressLoadedFirst = true;
          $scope.progressLoaded = true;
        })
        .catch($scope.genericError);
    };

    $scope.progressWidth = function () {
      return $scope.page.zoom ? Math.max(34 * $scope.progress.script.levels_count, 770) : 770;
    };

    $scope.scrollToStage = function ($event) {
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
        var progress_student = $.grep($scope.progress.students, function (e) { return e.id == student.id; })[0];
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
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard-tabbing',
        event: 'SectionResponsesController'
      }
    );

    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: 'control',
        event: 'text-responses'
      }
    );

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
      function ( sections ) {
        $scope.selectedSection = $.grep(sections, function (section) { return (section.id == $routeParams.id);})[0];
      }
    );

    $scope.responsesLoaded = false;
    $scope.stages = [];

    $scope.script_list = valid_scripts;

    // wait until we have both the students and the student progress
    $q.all([$scope.section.$promise, $scope.responses.$promise]).then(function () {
      $scope.responsesLoaded = true;
      $scope.findStages();
    });

    $scope.changeScript = function (scriptId) {
      $scope.responsesLoaded = false;
      $scope.stages = [];

      $scope.responses = sectionsService.responses({id: $routeParams.id, script_id: scriptId});

      $scope.responses.$promise.then(function () {
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
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard-tabbing',
        event: 'SectionAssessmentsController'
      }
    );

    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: 'control',
        event: 'assessments'
      }
    );

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
      function ( sections ) {
        $scope.selectedSection = $.grep(sections, function (section) { return (section.id == $routeParams.id);})[0];
      }
    );

    // Wait until we have initial section, assessment, and survey data.
    $q.all([$scope.section.$promise, $scope.assessments.$promise, $scope.surveys.$promise]).then(function () {
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
      $scope.assessments.$promise.then(function () {
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
