// My Professional Learning landing page
// studio.code.org/my-professional-learning

import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {connect, useDispatch} from 'react-redux';

import Tabs from '@cdo/apps/componentLibrary/tabs';
import {Heading2} from '@cdo/apps/componentLibrary/typography';
import DCDO from '@cdo/apps/dcdo';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import HeaderBannerNoImage from '@cdo/apps/templates/HeaderBannerNoImage';
import ActionBlocksWrapper from '@cdo/apps/templates/studioHomepages/ActionBlocksWrapper';
import BorderedCallToAction from '@cdo/apps/templates/studioHomepages/BorderedCallToAction';
import CoteacherInviteNotification from '@cdo/apps/templates/studioHomepages/CoteacherInviteNotification';
import JoinSectionArea from '@cdo/apps/templates/studioHomepages/JoinSectionArea';
import SetUpSections from '@cdo/apps/templates/studioHomepages/SetUpSections';
import shapes from '@cdo/apps/templates/studioHomepages/shapes';
import TwoColumnActionBlock from '@cdo/apps/templates/studioHomepages/TwoColumnActionBlock';
import AddSectionDialog from '@cdo/apps/templates/teacherDashboard/AddSectionDialog';
import OwnedSections from '@cdo/apps/templates/teacherDashboard/OwnedSections';
import {
  asyncLoadSectionData,
  asyncLoadCoteacherInvite,
  hiddenPlSectionIds,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {queryParams, updateQueryParam} from '../../utils';
import shapes from '@cdo/apps/templates/studioHomepages/shapes';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import DCDO from '@cdo/apps/dcdo';
import i18n from '@cdo/locale';

import {
  COURSE_CSF,
  COURSE_CSD,
  COURSE_CSP,
  COURSE_CSA,
} from '../workshop_dashboard/workshopConstants';

import {EnrolledWorkshops, WorkshopsTable} from './EnrolledWorkshops';
import SelfPacedProgressTable from './SelfPacedProgressTable';

import style from './landingPage.module.scss';

import './tableStyles.scss';

const getAvailableTabs = permissions => {
  let tabs = [
    {
      value: 'myPL',
      text: i18n.professionalLearning(),
    },
  ];

  if (permissions.includes('facilitator')) {
    tabs.push({
      value: 'myFacilitatorCenter',
      text: i18n.plLandingTabFacilitatorCenter(),
    });
  } else if (
    permissions.includes('universal_instructor') ||
    permissions.includes('plc_reviewer')
  ) {
    // We only want to show the Instructor Center if the user is also not a Facilitator
    tabs.push({
      value: 'instructorCenter',
      text: i18n.plLandingTabInstructorCenter(),
    });
  }

  if (permissions.includes('program_manager')) {
    tabs.push({
      value: 'RPCenter',
      text: i18n.plLandingTabRPCenter(),
    });
  }

  if (permissions.includes('workshop_organizer')) {
    tabs.push({
      value: 'workshopOrganizerCenter',
      text: i18n.plLandingTabWorkshopOrganizerCenter(),
    });
  }

  return tabs;
};

function LandingPage({
  lastWorkshopSurveyUrl,
  lastWorkshopSurveyCourse,
  deeperLearningCourseData,
  currentYearApplicationId,
  hasEnrolledInWorkshop,
  workshopsAsFacilitator,
  workshopsAsOrganizer,
  workshopsAsRegionalPartner,
  plCoursesStarted,
  userPermissions,
  joinedStudentSections,
  joinedPlSections,
  coursesAsFacilitator,
  plSectionIds,
  hiddenPlSectionIds,
}) {
  const availableTabs = getAvailableTabs(userPermissions);
  const [currentTab, setCurrentTab] = useState(availableTabs[0].value);
  const [showEnrollmentSuccessMessage, setShowEnrollmentSuccessMessage] =
    useState(false);
  const headerContainerStyles =
    availableTabs.length > 1
      ? style.headerWithTabsContainer
      : style.headerWithoutTabsContainer;

  const joinedPlSectionsStyling =
    joinedPlSections?.length > 0 ? '' : style.joinedPlSectionsWithNoSections;

  // If sent here from successfully enrolling in a workshop, log WORKSHOP_ENROLLMENT_COMPLETED_EVENT.
  const urlParams = queryParams();
  if (urlParams && Object.keys(urlParams).includes('rpName')) {
    analyticsReporter.sendEvent(EVENTS.WORKSHOP_ENROLLMENT_COMPLETED_EVENT, {
      'regional partner': urlParams['rpName'],
      'workshop course': urlParams['wsCourse'],
      'workshop subject': urlParams['wsSubject'],
    });

    updateQueryParam('rpName', undefined, false);
    updateQueryParam('wsCourse', undefined, false);
    updateQueryParam('wsSubject', undefined, false);

    setShowEnrollmentSuccessMessage(true);
  }

  // Load PL section info into redux
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(asyncLoadSectionData());
    dispatch(asyncLoadCoteacherInvite());
  }, [dispatch]);

  const RenderLastWorkshopSurveyBanner = () => (
    <TwoColumnActionBlock
      imageUrl={pegasus('/shared/images/fill-540x300/misc/teacher.png')}
      subHeading={i18n.plLandingSubheading()}
      description={i18n.plLandingDescription({
        course: lastWorkshopSurveyCourse,
      })}
      buttons={[
        {
          url: lastWorkshopSurveyUrl,
          text: i18n.plLandingStartSurvey(),
          target: '_blank',
        },
      ]}
    />
  );

  // Renders at most one banner for a user:
  // - if the user hasn't used any PL resources yet, show the Getting Started banner
  // - if the user has a pending workshop survery (mutually exclusive from the above), show a banner to fill out the survey
  // - else, render either nothing or an announcement banner
  const RenderBanner = () => {
    const showGettingStartedBanner =
      !currentYearApplicationId &&
      !hasEnrolledInWorkshop &&
      plCoursesStarted?.length === 0;

    if (showGettingStartedBanner) {
      return (
        <TwoColumnActionBlock
          imageUrl={pegasus(
            '/images/fill-540x300/professional-learning/pl-superhero-girl-crop.png'
          )}
          heading={i18n.plLandingGettingStartedHeading()}
          subHeading={i18n.plLandingGettingStartedSubHeading()}
          description={i18n.plLandingGettingStartedDescription()}
          buttons={[
            {
              url: pegasus('/educate/professional-learning'),
              text: i18n.plLandingGettingStartedButton(),
            },
          ]}
        />
      );
    } else if (lastWorkshopSurveyUrl) {
      return RenderLastWorkshopSurveyBanner();
    } else if (!!DCDO.get('curriculum-launch-2024', false)) {
      // TODO(ACQ-1998): Remove this block after the 2024 curriculum launch
      return (
        <TwoColumnActionBlock
          imageUrl={pegasus(
            '/images/fill-540x300/professional-learning/banner-books-with-background.png'
          )}
          subHeading={i18n.plLandingCurriculumLaunchBannerSubHeading()}
          description={i18n.plLandingCurriculumLaunchBannerDescription()}
          buttons={[
            {
              url: pegasus('/educate/professional-learning'),
              text: i18n.plLandingCurriculumLaunchBannerButtonText(),
              ariaLabel: i18n.plLandingCurriculumLaunchBannerButtonAriaLabel(),
            },
          ]}
        />
      );
    }
  };

  const RenderSelfPacedPL = () => {
    return (
      <section id={'self-paced-pl'}>
        <Heading2>{i18n.plLandingSelfPacedProgressHeading()}</Heading2>
        <SelfPacedProgressTable plCoursesStarted={plCoursesStarted} />
      </section>
    );
  };

  const RenderStaticRecommendedPL = () => {
    const actionBlocks = [
      {
        overline: i18n.plLandingStaticPLMidHighOverline(),
        imageUrl: pegasus('/images/pl-page-educator-support.png'),
        heading: i18n.plLandingStaticPLMidHighHeading(),
        description: i18n.plLandingStaticPLMidHighDesc(),
        buttons: [
          {
            color: 'purple',
            url: pegasus('/educate/professional-learning/middle-high'),
            text: i18n.plLandingStaticPLMidHighButton(),
          },
        ],
      },
      {
        overline: i18n.plLandingStaticPLSelfPacedOverline(),
        imageUrl: pegasus('/images/fill-448x280/admins-page-pl.png'),
        heading: i18n.plLandingStaticPLSelfPacedHeading(),
        description: i18n.plLandingStaticPLSelfPacedDesc(),
        buttons: [
          {
            color: 'purple',
            url: pegasus('/educate/professional-development-online'),
            text: i18n.plLandingStaticPLSelfPacedButton(),
          },
        ],
      },
    ];
    return <ActionBlocksWrapper actionBlocks={actionBlocks} />;
  };

  const RenderOwnedPlSections = () => {
    return (
      <section>
        <Heading2>{i18n.plSectionsInstructorTitle()}</Heading2>
        <SetUpSections
          headingText={i18n.newSectionCreate()}
          descriptionText={i18n.newSectionMyPlAdd()}
          solidBorder={true}
        />
        <CoteacherInviteNotification isForPl={true} />
        <OwnedSections
          isPlSections={true}
          sectionIds={plSectionIds}
          hiddenSectionIds={hiddenPlSectionIds}
        />
        <AddSectionDialog />
      </section>
    );
  };

  const RenderFacilitatorResources = () => {
    let allResources = [
      {
        headingText: i18n.plSectionsWorkshopTitle(),
        descriptionText: i18n.plSectionsWorkshopDesc(),
        buttonText: i18n.plSectionsWorkshopButton(),
        buttonUrl: '/pd/workshop_dashboard',
      },
    ];

    let landingPageCourses = [];
    if (coursesAsFacilitator.includes(COURSE_CSF)) {
      landingPageCourses.push('CSF');
    }
    if (coursesAsFacilitator.includes(COURSE_CSD)) {
      landingPageCourses.push('CSD');
    }
    if (coursesAsFacilitator.includes(COURSE_CSP)) {
      landingPageCourses.push('CSP');
    }
    if (coursesAsFacilitator.includes(COURSE_CSA)) {
      landingPageCourses.push('CSA');
    }
    landingPageCourses.forEach(coursePage => {
      allResources.push({
        headingText: i18n.plSectionsFacilitatorResourcesTitle({
          course_name: coursePage,
        }),
        descriptionText: i18n.plSectionsFacilitatorResourcesDesc({
          course_name: coursePage,
        }),
        buttonText: i18n.plSectionsFacilitatorResourcesButton({
          course_name: coursePage,
        }),
        buttonUrl: pegasus(`/educate/facilitator-landing/${coursePage}`),
      });
    });

    if (deeperLearningCourseData?.length >= 1) {
      allResources.push({
        headingText: i18n.plSectionsOnboardingTitle(),
        descriptionText: i18n.plSectionsOnboardingDesc(),
        buttonText: i18n.plSectionsOnboardingButton(),
        buttonUrl: '/deeper-learning',
      });
    }

    return (
      <>
        {allResources.map((resource, index) => (
          <BorderedCallToAction
            key={index}
            headingText={resource.headingText}
            descriptionText={resource.descriptionText}
            buttonText={resource.buttonText}
            buttonUrl={resource.buttonUrl}
            solidBorder={true}
          />
        ))}
      </>
    );
  };

  const RenderRegionalPartnerResources = () => {
    const resources = [
      {
        headingText: i18n.plSectionsRegionalPartnerApplicationTitle(),
        descriptionText: i18n.plSectionsRegionalPartnerApplicationDesc(),
        buttonText: i18n.plSectionsRegionalPartnerApplicationButton(),
        buttonUrl: '/pd/application_dashboard',
      },
      {
        headingText: i18n.plSectionsWorkshopTitle(),
        descriptionText: i18n.plSectionsWorkshopDesc(),
        buttonText: i18n.plSectionsWorkshopButton(),
        buttonUrl: '/pd/workshop_dashboard',
      },
      {
        headingText: i18n.plSectionsRegionalPartnerPlaybookTitle(),
        descriptionText: i18n.plSectionsRegionalPartnerPlaybookDesc(),
        buttonText: i18n.plSectionsRegionalPartnerPlaybookButton(),
        buttonUrl: pegasus('/educate/regional-partner/playbook'),
      },
    ];
    return (
      <>
        {resources.map((resource, index) => (
          <BorderedCallToAction
            key={index}
            headingText={resource.headingText}
            descriptionText={resource.descriptionText}
            buttonText={resource.buttonText}
            buttonUrl={resource.buttonUrl}
            solidBorder={true}
          />
        ))}
      </>
    );
  };

  const RenderMyPlTab = () => {
    return (
      <>
        {showEnrollmentSuccessMessage && (
          <div style={successMessageStyling.successContainer}>
            <div style={successMessageStyling.successMessage}>
              <p style={successMessageStyling.text}>
                You successfully enrolled in a Build Your Own workshop!
              </p>
              <button
                aria-label="close success message"
                onClick={() => setShowEnrollmentSuccessMessage(false)}
                type="button"
                style={successMessageStyling.button}
              >
                <strong>X</strong>
              </button>
            </div>
          </div>
        )}
        {RenderBanner()}
        {plCoursesStarted?.length >= 1 && RenderSelfPacedPL()}
        <div className={joinedPlSectionsStyling}>
          <JoinSectionArea
            initialJoinedStudentSections={joinedStudentSections}
            initialJoinedPlSections={joinedPlSections}
            isTeacher={true}
            isPlSections={true}
          />
        </div>
        <EnrolledWorkshops />
        <section>
          <Heading2>{i18n.plLandingRecommendedHeading()}</Heading2>
          {RenderStaticRecommendedPL()}
        </section>
      </>
    );
  };

  const RenderFacilitatorCenterTab = () => {
    return (
      <>
        {lastWorkshopSurveyUrl && RenderLastWorkshopSurveyBanner()}
        <section>
          <Heading2>{i18n.plSectionsFacilitatorResources()}</Heading2>
          {RenderFacilitatorResources()}
        </section>
        {RenderOwnedPlSections()}
        {workshopsAsFacilitator?.length > 0 && (
          <WorkshopsTable
            workshops={workshopsAsFacilitator}
            forMyPlPage={true}
            tableHeader={i18n.inProgressAndUpcomingWorkshops()}
          />
        )}
      </>
    );
  };

  const RenderInstructorCenterTab = () => {
    return RenderOwnedPlSections();
  };

  const RenderRPCenterTab = () => {
    return (
      <>
        {lastWorkshopSurveyUrl && RenderLastWorkshopSurveyBanner()}
        <section>
          <Heading2>{i18n.plSectionsRegionalPartnerResources()}</Heading2>
          {RenderRegionalPartnerResources()}
        </section>
        {workshopsAsRegionalPartner?.length > 0 && (
          <WorkshopsTable
            workshops={workshopsAsRegionalPartner}
            forMyPlPage={true}
            tableHeader={i18n.inProgressAndUpcomingWorkshops()}
          />
        )}
      </>
    );
  };

  const RenderWorkshopOrganizerCenterTab = () => {
    return (
      <>
        {lastWorkshopSurveyUrl && RenderLastWorkshopSurveyBanner()}
        <section>
          <Heading2>{i18n.plSectionsWorkshopResources()}</Heading2>
          <BorderedCallToAction
            key={4}
            headingText={i18n.plSectionsWorkshopTitle()}
            descriptionText={i18n.plSectionsWorkshopDesc()}
            buttonText={i18n.plSectionsWorkshopButton()}
            buttonUrl={'/pd/workshop_dashboard'}
            solidBorder={true}
          />
        </section>
        {workshopsAsOrganizer?.length > 0 && (
          <WorkshopsTable
            workshops={workshopsAsOrganizer}
            forMyPlPage={true}
            tableHeader={i18n.inProgressAndUpcomingWorkshops()}
          />
        )}
      </>
    );
  };

  return (
    <>
      <div className={`${headerContainerStyles} ${style.headerContainer}`}>
        <HeaderBannerNoImage headingText={i18n.professionalLearning()}>
          {availableTabs.length > 1 && (
            <nav className={style.myPlTabsContainer}>
              <Tabs
                name="myPLTabs"
                tabs={availableTabs}
                defaultSelectedTabValue={availableTabs[0].value}
                onChange={tab => setCurrentTab(tab)}
              />
            </nav>
          )}
        </HeaderBannerNoImage>
      </div>
      <main className={style.wrapper}>
        {currentTab === 'myPL' && RenderMyPlTab()}
        {currentTab === 'myFacilitatorCenter' && RenderFacilitatorCenterTab()}
        {currentTab === 'instructorCenter' && RenderInstructorCenterTab()}
        {currentTab === 'RPCenter' && RenderRPCenterTab()}
        {currentTab === 'workshopOrganizerCenter' &&
          RenderWorkshopOrganizerCenterTab()}
      </main>
    </>
  );
}

const successMessageStyling = {
  successContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  successMessage: {
    display: 'flex',
    minWidth: '250px',
    backgroundColor: 'green',
    textAlign: 'center',
    borderRadius: '5px',
    position: 'fixed',
    zIndex: 4,
    top: '240px',
  },
  button: {
    maxHeight: '1.5em',
    margin: '3px 6px',
    padding: 0,
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '12px',
  },
  text: {
    margin: '16px',
    color: 'black',
  },
};

export const UnconnectedLandingPage = LandingPage;

export default connect(state => ({
  plSectionIds: state.teacherSections.plSectionIds,
  hiddenPlSectionIds: hiddenPlSectionIds(state),
}))(LandingPage);

LandingPage.propTypes = {
  lastWorkshopSurveyUrl: PropTypes.string,
  lastWorkshopSurveyCourse: PropTypes.string,
  deeperLearningCourseData: PropTypes.array,
  currentYearApplicationId: PropTypes.number,
  hasEnrolledInWorkshop: PropTypes.bool,
  workshopsAsFacilitator: PropTypes.array,
  workshopsAsOrganizer: PropTypes.array,
  workshopsAsRegionalPartner: PropTypes.array,
  plCoursesInstructed: PropTypes.array,
  plCoursesStarted: PropTypes.array,
  userPermissions: PropTypes.arrayOf(PropTypes.string),
  joinedStudentSections: shapes.sections,
  joinedPlSections: shapes.sections,
  coursesAsFacilitator: PropTypes.arrayOf(PropTypes.string),
  plSectionIds: PropTypes.arrayOf(PropTypes.number),
  hiddenPlSectionIds: PropTypes.arrayOf(PropTypes.number),
};
