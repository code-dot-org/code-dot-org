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
import WorkshopFilter from './workshop_filter';
import WorkshopIndex from './workshop_index';
import {WorkshopFormTemplate} from './WorkshopFormTemplate';
import {workshopLabel} from './WorkshopFormTemplate/utils';
import {WorkshopAttendance} from './workshops/attendance/WorkshopAttendance';
import {WorkshopEnrollments} from './workshops/enrollments/WorkshopEnrollments';
import {WorkshopOverview} from './workshops/overview/WorkshopOverview';
import {Engagement} from './workshops/surveys/post/components/Engagement';
import {FacilitatorFeedback} from './workshops/surveys/post/components/FacilitatorFeedback';
import {Implementation} from './workshops/surveys/post/components/Implementation';
import {Logistics} from './workshops/surveys/post/components/Logistics';
import {Other} from './workshops/surveys/post/components/Other';
import {WorkshopLayout} from './workshops/WorkshopLayout';

export const ROOT_PATH = '/pd/workshop_dashboard';

const store = createStore(
  combineReducers({
    workshopDashboard: workshopDashboardReducers,
    regionalPartners: regionalPartnerReducers,
    mapbox: mapboxReducer,
  })
);

const postSurveyCategoryChildRoutes = [
  {
    label: 'Implementation',
    path: 'implementation',
    icon: 'rocket',
    component: Implementation,
    breadcrumbs: 'Workshops,Workshop,Temp,Surveys,Post,Implementation',
  },
  {
    label: 'Engagement',
    path: 'engagement',
    icon: 'heart',
    component: Engagement,
    breadcrumbs: 'Workshops,Workshop,Temp,Surveys,Post,Engagement',
  },
  {
    label: 'Logistics',
    path: 'logistics',
    icon: 'calendar-check',
    component: Logistics,
    breadcrumbs: 'Workshops,Workshop,Temp,Surveys,Post,Logistics',
  },
  {
    label: 'Facilitator Feedback',
    path: 'facilitators',
    icon: 'star',
    component: Outlet,
    breadcrumbs: 'Workshops,Workshop,Temp,Surveys,Post,Facilitators',
    childRoutes: [
      {
        path: ':facilitatorId',
        component: FacilitatorFeedback,
        breadcrumbs:
          'Workshops,Workshop,Temp,Surveys,Post,Facilitators,Facilitator',
      },
    ],
  },
  {
    label: 'Other',
    path: 'other',
    icon: 'ellipsis',
    component: Other,
    breadcrumbs: 'Workshops,Workshop,Temp,Surveys,Post,Other',
  },
];

const surveyTypeChildRoutes = [
  {
    label: 'Pre-workshop survey',
    path: 'pre',
    component: () => <div>Pre workshop</div>,
    breadcrumbs: 'Workshops,Workshop,Temp,Surveys,Pre',
  },
  {
    label: 'Post-workshop survey',
    path: 'post',
    component: Outlet,
    breadcrumbs: 'Workshops,Workshop,Temp,Surveys,Post',
    childRoutes: [
      // this makes "implementation" the default
      {
        index: true,
        component: () => <Navigate to="implementation" replace />,
      },
      ...postSurveyCategoryChildRoutes,
    ],
  },
];

const workshopChildRouteConfigs = [
  {
    label: 'Overview',
    index: true,
    component: WorkshopOverview,
  },
  {
    label: 'Enrollment',
    path: 'enrollments',
    component: WorkshopEnrollments,
    breadcrumbs: 'Workshops,Workshop,Temp,Enrollments',
  },
  {
    label: 'Attendance',
    path: 'attendance',
    component: WorkshopAttendance,
    breadcrumbs: 'Workshops,Workshop,Temp,Attendance',
  },
  {
    label: 'Surveys',
    path: 'surveys',
    component: Outlet,
    breadcrumbs: 'Workshops,Workshop,Temp,Surveys',
    childRoutes: [
      // this makes "post" the default
      {
        index: true,
        component: () => <Navigate to="post" replace />,
      },
      ...surveyTypeChildRoutes,
    ],
  },
];

const routeConfigs = [
  {
    path: 'reports',
    breadcrumbs: 'Reports',
    component: ReportView,
    withRouter: true,
  },
  {
    path: 'workshops',
    breadcrumbs: 'Workshops',
    component: WorkshopIndex,
    withRouter: true,
  },
  {
    path: 'workshops/filter',
    breadcrumbs: 'Workshops,Filter',
    component: WorkshopFilter,
    withRouter: true,
  },
  ...WorkshopCourseConfigs.map(config => ({
    path: `workshops/new/${config.slug}`,
    breadcrumbs: `Workshops,${workshopLabel(`New ${config.label}`)}`,
    component: WorkshopFormTemplate,
    props: {config},
  })),
  // replace with temp route when ready to switch over
  {
    path: 'workshops/:workshopId',
    breadcrumbs: 'Workshops,View Workshop',
    component: Workshop,
    withRouter: true,
  },
  {
    // remove /temp for switch over
    path: 'workshops/:workshopId/temp',
    breadcrumbs: 'Workshops,Workshop,Temp',
    component: WorkshopLayout,
    props: {
      tabList: workshopChildRouteConfigs.map(({label, path}) => ({
        label,
        path,
      })),
      surveyTypeOptions: surveyTypeChildRoutes.map(({label, path}) => ({
        text: label,
        value: `surveys/${path}`,
      })),
      questionCategoryButtons: postSurveyCategoryChildRoutes.map(
        ({label, path, icon}) => ({
          label,
          value: `surveys/post/${path}`,
          iconLeft: {iconName: icon},
        })
      ),
    },
    childRoutes: [
      ...workshopChildRouteConfigs,
      {
        path: 'edit',
        breadcrumbs: 'Workshops,Workshop,Temp,Edit',
        component: WorkshopFormTemplate,
      },
    ],
  },
  {
    path: 'workshops/:workshopId/edit',
    breadcrumbs: 'Workshops,Edit Workshop',
    component: WorkshopFormTemplate,
  },
  {
    path: 'workshops/:workshopId/attendance',
    breadcrumbs: 'Workshops,Workshop,Take Attendance',
    component: WorkshopAttendance,
    withRouter: true,
  },
  {
    path: 'workshops/:workshopId/attendance/:sessionId',
    breadcrumbs: 'Workshops,Workshop,Take Attendance',
    component: WorkshopAttendance,
    withRouter: true,
  },
  {
    path: 'daily_survey_results/:workshopId',
    breadcrumbs: 'Survey Results',
    component: DailySurveyResultsLoader,
    withRouter: true,
  },
  {
    path: 'workshop_daily_survey_results/:workshopId',
    breadcrumbs: 'Survey Results',
    component: FoormDailySurveyResultsLoader,
    withRouter: true,
  },
  {
    path: 'legacy_survey_summaries',
    breadcrumbs: 'Legacy Facilitator Survey Summaries',
    component: LegacySurveySummaries,
    withRouter: true,
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

const renderRoute = ({
  path,
  index,
  component: Component,
  withRouter,
  childRoutes,
  props = {},
}) => (
  <Route
    key={index ? 'index-route' : path}
    path={path}
    index={index}
    element={
      withRouter ? (
        <WithRouterProps component={Component} {...props} />
      ) : (
        <Component {...props} />
      )
    }
  >
    {childRoutes?.map(renderRoute)}
  </Route>
);

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
              {routeConfigs.map(renderRoute)}
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
