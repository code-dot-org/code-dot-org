/**
 * Main landing page and router for the workshop dashboard.
 */
import PropTypes from 'prop-types';
import React, {useContext, useEffect} from 'react';
import {Provider} from 'react-redux';
import {BrowserRouter, Routes, Route, Navigate, Outlet} from 'react-router-dom';
import {createStore, combineReducers} from 'redux';

import {
  RouterContext,
  RouterProvider,
  WithRouterProps,
} from '@cdo/apps/code-studio/legacyDashboardRoutingCompatibility';
import {WorkshopCourseConfigs} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import mapboxReducer, {setMapboxAccessToken} from '@cdo/apps/redux/mapbox';

import Header from '../components/header';
import {
  RegionalPartnerShape,
  ALL_PARTNERS_OPTION,
} from '../components/regional_partner_dropdown';
import regionalPartnerReducers, {
  setRegionalPartners,
  setRegionalPartnerFilter,
  getInitialRegionalPartnerFilter,
} from '../components/regional_partners_reducers';

import WorkshopAttendance from './attendance/workshop_attendance';
import LegacySurveySummaries from './legacy_survey_summaries.jsx';
import NewWorkshop from './new_workshop';
import {WorkshopAdmin} from './permission';
import workshopDashboardReducers, {
  setPermission,
  setFacilitatorCourses,
} from './reducers';
import FoormDailySurveyResultsLoader from './reports/foorm/results_loader';
import DailySurveyResultsLoader from './reports/local_summer_workshop_daily_survey/results_loader';
import ReportView from './reports/report_view';
import Workshop from './workshop';
import WorkshopFilter from './workshop_filter';
import WorkshopIndex from './workshop_index';
import {WorkshopFormTemplate} from './WorkshopFormTemplate';

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
  {
    path: 'workshops/new',
    breadcrumbs: 'Workshops,New Workshop',
    component: NewWorkshop,
  },
  ...WorkshopCourseConfigs.map(config => ({
    path: `workshops/new/${config.slug}`,
    breadcrumbs: `Workshops,New ${config.label} Workshop`,
    component: WorkshopFormTemplate,
    props: config,
  })),
  {
    path: 'workshops/:workshopId',
    breadcrumbs: 'Workshops,View Workshop',
    component: Workshop,
    props: {view: 'show'},
  },
  {
    path: 'workshops/:workshopId/edit',
    breadcrumbs: 'Workshops,Edit Workshop',
    component: Workshop,
    props: {view: 'edit'},
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
              {routeConfigs.map(({path, component, props = {}}) => (
                <Route
                  key={path}
                  path={path}
                  element={<WithRouterProps component={component} {...props} />}
                />
              ))}
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
