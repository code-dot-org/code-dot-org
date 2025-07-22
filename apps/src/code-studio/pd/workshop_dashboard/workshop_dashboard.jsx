/**
 * Main landing page and router for the workshop dashboard.
 */
import PropTypes from 'prop-types';
import React, {useContext, useEffect} from 'react';
import {Provider} from 'react-redux';
import {BrowserRouter, Navigate, Outlet, Route, Routes} from 'react-router-dom';
import {combineReducers, createStore} from 'redux';

import {
  RouterContext,
  RouterProvider,
  WithRouterProps,
} from '@cdo/apps/code-studio/legacyDashboardRoutingCompatibility';
import {WorkshopCourseConfigs} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import mapboxReducer, {setMapboxAccessToken} from '@cdo/apps/redux/mapbox';

import Header from '../components/header';
import {
  ALL_PARTNERS_OPTION,
  RegionalPartnerShape,
} from '../components/regional_partner_dropdown';
import regionalPartnerReducers, {
  getInitialRegionalPartnerFilter,
  setRegionalPartnerFilter,
  setRegionalPartners,
} from '../components/regional_partners_reducers';

import WorkshopAttendance from './attendance/workshop_attendance';
import LegacySurveySummaries from './legacy_survey_summaries.jsx';
import {WorkshopAdmin} from './permission';
import workshopDashboardReducers, {
  setFacilitatorCourses,
  setPermission,
} from './reducers';
import FoormDailySurveyResultsLoader from './reports/foorm/results_loader';
import DailySurveyResultsLoader from './reports/local_summer_workshop_daily_survey/results_loader';
import ReportView from './reports/report_view';
import Workshop from './workshop';
import {WorkshopEnrollments} from './workshop/components/WorkshopEnrollments';
import {WorkshopOverview} from './workshop/components/WorkshopOverview';
import {WorkshopSurveys} from './workshop/components/WorkshopSurveys';
import {WorkshopTabs} from './workshop/components/WorkshopTabs';
import WorkshopFilter from './workshop_filter';
import WorkshopIndex from './workshop_index';
import {WorkshopFormTemplate} from './WorkshopFormTemplate';
import {workshopLabel} from './WorkshopFormTemplate/utils';

export const ROOT_PATH = '/pd/workshop_dashboard';

const store = createStore(
  combineReducers({
    workshopDashboard: workshopDashboardReducers,
    regionalPartners: regionalPartnerReducers,
    mapbox: mapboxReducer,
  })
);

const routeConfigs = [
  {
    path: 'reports',
    breadcrumbs: 'Reports',
    component: ReportView,
  },
  {
    path: 'workshops',
    breadcrumbs: 'Workshops',
    component: WorkshopIndex,
  },
  {
    path: 'workshops/filter',
    breadcrumbs: 'Workshops,Filter',
    component: WorkshopFilter,
  },
  ...WorkshopCourseConfigs.map(config => ({
    path: `workshops/new/${config.slug}`,
    breadcrumbs: `Workshops,${workshopLabel(`New ${config.label}`)}`,
    component: WorkshopFormTemplate,
    props: {config},
    noRouter: true,
  })),
  // replace with temp route when ready to switch over
  {
    path: 'workshops/:workshopId',
    breadcrumbs: 'Workshops,View Workshop',
    component: Workshop,
  },
  {
    // remove /temp for switch over
    path: 'workshops/:workshopId/temp',
    breadcrumbs: 'Workshops,Workshop Overview',
    noRouter: true,
    component: WorkshopTabs,
    children: [
      {
        index: true,
        component: WorkshopOverview,
      },
      {
        path: 'enrollments',
        component: WorkshopEnrollments,
        breadcrumbs: 'Workshops,Workshop Overview,Enrollments',
      },
      {
        path: 'surveys',
        component: WorkshopSurveys,
        breadcrumbs: 'Workshops,Workshop Overview,Surveys',
      },
    ],
  },
  {
    path: 'workshops/:workshopId/edit',
    breadcrumbs: 'Workshops,Edit Workshop',
    component: WorkshopFormTemplate,
    noRouter: true,
  },
  {
    path: 'workshops/:workshopId/attendance',
    breadcrumbs: 'Workshops,Workshop,Take Attendance',
    component: WorkshopAttendance,
  },
  {
    path: 'workshops/:workshopId/attendance/:sessionId',
    breadcrumbs: 'Workshops,Workshop,Take Attendance',
    component: WorkshopAttendance,
  },
  {
    path: 'daily_survey_results/:workshopId',
    breadcrumbs: 'Survey Results',
    component: DailySurveyResultsLoader,
  },
  {
    path: 'workshop_daily_survey_results/:workshopId',
    breadcrumbs: 'Survey Results',
    component: FoormDailySurveyResultsLoader,
  },
  {
    path: 'legacy_survey_summaries',
    breadcrumbs: 'Legacy Facilitator Survey Summaries',
    component: LegacySurveySummaries,
  },
];

const HeaderWrapper = () => {
  const {router} = useContext(RouterContext);
  return (
    <>
      <WithRouterProps
        component={Header}
        routeConfigs={routeConfigs}
        baseName="Workshop Dashboard"
        router={router}
      />
      <Outlet />
    </>
  );
};

const WorkshopDashboard = ({
  permissionList,
  facilitatorCourses,
  mapboxAccessToken,
  regionalPartners,
}) => {
  useEffect(() => {
    if (permissionList) {
      store.dispatch(setPermission(permissionList));
    }

    if (facilitatorCourses) {
      store.dispatch(setFacilitatorCourses(facilitatorCourses));
    }

    if (mapboxAccessToken) {
      store.dispatch(setMapboxAccessToken(mapboxAccessToken));
    }

    store.dispatch(setRegionalPartners(regionalPartners));
    store.dispatch(
      setRegionalPartnerFilter(
        getInitialRegionalPartnerFilter(
          permissionList.includes(WorkshopAdmin),
          regionalPartners,
          ALL_PARTNERS_OPTION
        )
      )
    );
  }, [permissionList, facilitatorCourses, mapboxAccessToken, regionalPartners]);

  return (
    <Provider store={store}>
      <BrowserRouter basename={ROOT_PATH}>
        <RouterProvider basename={ROOT_PATH}>
          <Routes>
            <Route path="/" element={<HeaderWrapper />}>
              <Route index element={<Navigate to="/workshops" replace />} />
              {routeConfigs.map(
                ({
                  path,
                  component: Component,
                  noRouter,
                  children,
                  props = {},
                }) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      noRouter ? (
                        <Component {...props} />
                      ) : (
                        <WithRouterProps component={Component} {...props} />
                      )
                    }
                  >
                    {children?.map(
                      ({component: ChildComponent, path, index}) => (
                        <Route
                          key={path ?? 'index-route'}
                          path={path}
                          index={index}
                          element={<ChildComponent />}
                        />
                      )
                    )}
                  </Route>
                )
              )}
            </Route>
          </Routes>
        </RouterProvider>
      </BrowserRouter>
    </Provider>
  );
};

WorkshopDashboard.propTypes = {
  permissionList: PropTypes.arrayOf(PropTypes.string).isRequired,
  facilitatorCourses: PropTypes.arrayOf(PropTypes.string).isRequired,
  regionalPartners: PropTypes.arrayOf(RegionalPartnerShape),
  mapboxAccessToken: PropTypes.string,
};

export default WorkshopDashboard;
