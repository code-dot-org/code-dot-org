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
import SectionAssessments from '@cdo/apps/templates/sectionAssessments/SectionAssessments';
import GDPRDialog from '@cdo/apps/templates/GDPRDialog';
import experiments from '@cdo/apps/util/experiments';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {
  renderSyncOauthSectionControl,
  unmountSyncOauthSectionControl,
  renderSectionTable,
  renderStatsTable,
  renderTextResponsesTable
} from '@cdo/apps/templates/teacherDashboard/sections';
import logToCloud from '@cdo/apps/logToCloud';
import scriptSelection, { loadValidScripts } from '@cdo/apps/redux/scriptSelectionRedux';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import sectionData, { setSection } from '@cdo/apps/redux/sectionDataRedux';
import sectionAssessments,
  { asyncLoadAssessments } from '@cdo/apps/templates/sectionAssessments/sectionAssessmentsRedux';

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

function renderSectionAssessments(section, validScripts) {
  registerReducers({scriptSelection, sectionData, sectionAssessments});
  const store = getStore();
  store.dispatch(setSection(section));

  store.dispatch(loadValidScripts(section, validScripts)).then(() => {
    const scriptId = store.getState().scriptSelection.scriptId;
    store.dispatch(asyncLoadAssessments(section.id, scriptId));
    ReactDOM.render(
      <Provider store={store}>
        <SectionAssessments />
      </Provider>,
      document.getElementById('section-assessments-react')
    );
  });
}

function renderSectionProgress(section, validScripts) {
  registerReducers({sectionProgress, scriptSelection, sectionData});
  const store = getStore();
  store.dispatch(setSection(section));
  store.dispatch(loadValidScripts(section, validScripts)).then(() => renderSectionProgressReact(store));
}

function renderSectionProgressReact(store) {
  ReactDOM.render(
    <Provider store={store}>
      <SectionProgress />
    </Provider>,
    document.getElementById('section-progress-react')
  );
}

$(document).ready(function () {
  const gdprData = scriptData.gdpr;
  const studioUrlPrefix = scriptData.studiourlprefix;
  ReactDOM.render(
    <GDPRDialog
      isDialogOpen={gdprData.show_gdpr_dialog}
      currentUserId={gdprData.current_user_id}
      studioUrlPrefix={studioUrlPrefix}
    />,
    document.getElementById('gdpr-dialog')
  );
});
//  Everything below was copied wholesale from index.haml, where we had no linting.
// TODO (bjvanminnen): Fix remaining lint errors and re-enable rules.
/* eslint-disable eqeqeq, no-unused-vars */
function main() {
  const studioUrlPrefix = scriptData.studiourlprefix;
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
    $routeProvider.when('/',
      {redirectTo: function () {
        window.location = `${studioUrlPrefix}/home`;
      }}
    );
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
      return $resource('/dashboardapi/sections/:id', {}, {
      // default methods: see https://code.angularjs.org/1.2.21/docs/api/ngResource/service/$resource
      //  'get':    {method:'GET'},
      //  'save':   {method:'POST'},
      //  'query':  {method:'GET', isArray:true},
      //  'remove': {method:'DELETE'},
      //  'delete': {method:'DELETE'}
         progress: {method:'GET', url:'/dashboardapi/section_progress/:id'},
         studentProgress: {method:'GET', url:'/dashboardapi/student_progress/:id/:studentId'},
         responses: {method:'GET', url:'/dashboardapi/section_text_responses/:id', isArray: true},
         validScripts: {method:'GET', url:'/dashboardapi/sections/valid_scripts', isArray: true},
      });
    }]).config(['$httpProvider', function ($httpProvider) {
      // X-Requested-With header required for CSRF requests protected by Rack::Protection::JsonCsrf included by Sinatra.
      // Angular originally set this, but removed it in a breaking change in v1.4 because it is "rarely used in practice":
      // https://github.com/angular/angular.js/commit/3a75b1124d062f64093a90b26630938558909e8d
      $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
      $httpProvider.defaults.cache = true;
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
    $scope.script_list = sectionsService.validScripts();

    $scope.progress = sectionsService.studentProgress({id: $routeParams.sectionid, studentId: $routeParams.studentid});

    $scope.changeProgress = function () {
      $scope.progress = sectionsService.studentProgress({id: $routeParams.sectionid, studentId: $routeParams.studentid, script_id: $scope.script_id});
    };
  }]);

  app.controller('SectionDetailController', ['$scope', '$routeParams', '$window', '$q', '$location', 'sectionsService',
                                             function ($scope, $routeParams, $window, $q, $location, sectionsService) {
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
        $scope.section.$promise.then(renderStatsTable);
        firehoseClient.putRecord(
          {
            study: 'teacher-dashboard',
            study_group: 'react',
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
            rosterProvider: section.login_type
          })
        );
      });

      $scope.$on('student-table-react-rendered', () => {
        $scope.section.$promise.then(section => renderSectionTable(section, scriptData.studiourlprefix));
        firehoseClient.putRecord(
          {
            study: 'teacher-dashboard',
            study_group: 'react',
            event: 'manage'
          }
        );
      });

      $scope.$on('$destroy', () => {
        unmountSyncOauthSectionControl();
      });
    }
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
        study_group: 'react',
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

  app.controller('SectionProgressController', ['$scope', '$routeParams', '$window', '$q', '$timeout', '$interval', 'sectionsService', 'paginatedSectionProgressService',
                                             function ($scope, $routeParams, $window, $q, $timeout, $interval, sectionsService, paginatedSectionProgressService) {
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard-tabbing',
        event: 'SectionProgressController'
      }
    );

    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: experiments.isEnabled(experiments.TEACHER_EXP_2018) ? 'react' : 'angular',
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
          study_group: 'angular',
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
          study_group: 'angular',
          event: 'progress-summary'
        }
      );
    };

    $scope.script_list = sectionsService.validScripts();

    $scope.react_progress = true;
    $scope.$on('section-progress-rendered', () => {
      $scope.section.$promise.then(script => {
        $scope.script_list.$promise.then(validScripts => {
          renderSectionProgress(script, validScripts);
        });
      });
    });
  }]);

  app.controller('SectionResponsesController', ['$scope', '$routeParams', '$window', '$q', '$timeout', '$interval', '$sanitize', 'sectionsService',
                                             function ($scope, $routeParams, $window, $q, $timeout, $interval, $sanitize, sectionsService) {
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard-tabbing',
        event: 'SectionResponsesController'
      }
    );

    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: experiments.isEnabled(experiments.TEACHER_EXP_2018) ? 'react' : 'angular',
        event: 'text-responses'
      }
    );

    $scope.section = sectionsService.get({id: $routeParams.id});
    $scope.sections = sectionsService.query();
    $scope.script_list = sectionsService.validScripts();
    $scope.tab = 'responses';

    // the ng-select in the nav compares by reference not by value, so we can't just set
    // selectedSection to section, we have to find it in sections.
    $scope.sections.$promise.then(sections => {
      $scope.selectedSection = sections.find(section => section.id.toString() === $routeParams.id);
    });

    $scope.react_text_responses = true;
    $scope.$on('text-responses-table-rendered', () => {
      $scope.section.$promise.then(section => {
        $scope.script_list.$promise.then(validScripts => {
          renderTextResponsesTable(section, validScripts);
        });
      });
    });
  }]);


  app.controller('SectionAssessmentsController', ['$scope', '$routeParams', '$window', '$q', '$timeout', '$interval', '$sanitize', 'sectionsService',
                                             function ($scope, $routeParams, $window, $q, $timeout, $interval, $sanitize, sectionsService) {
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard-tabbing',
        event: 'SectionAssessmentsController'
      }
    );

    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: experiments.isEnabled(experiments.TEACHER_EXP_2018) ? 'react' : 'angular',
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

    // the ng-select in the nav compares by reference not by value, so we can't just set
    // selectedSection to section, we have to find it in sections.
    $scope.sections.$promise.then(sections => {
      $scope.selectedSection = sections.find(section => section.id.toString() === $routeParams.id);
    });

    $scope.script_list = sectionsService.validScripts();

    $scope.assessmentsLoaded = false;
    $scope.assessmentStages = [];

    $scope.surveysLoaded = false;
    $scope.surveyStages = [];

    $scope.react_assessments = true;
    $scope.$on('section-assessments-rendered', () => {
      $scope.section.$promise.then(script => {
        $scope.script_list.$promise.then(scriptList => (
          renderSectionAssessments(script, scriptList)
        ));
      });
    });
  }]);

}
