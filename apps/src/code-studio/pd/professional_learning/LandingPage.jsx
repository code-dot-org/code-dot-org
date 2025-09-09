// My Professional Learning landing page
// studio.code.org/my-professional-learning

import Tabs from '@code-dot-org/component-library/tabs';
import {Heading2} from '@code-dot-org/component-library/typography';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {connect, useDispatch} from 'react-redux';

import DCDO from '@cdo/apps/dcdo';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import GlobalEditionWrapper from '@cdo/apps/templates/GlobalEditionWrapper';
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
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {hiddenPlSectionIds} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import i18n from '@cdo/locale';

import {
  COURSE_CSF,
  COURSE_CSD,
  COURSE_CSP,
  COURSE_CSA,
  COURSE_AIF,
} from '../workshop_dashboard/workshopConstants';
import WorkshopEnrollmentCelebrationDialog from '../workshop_enrollment/WorkshopEnrollmentCelebrationDialog';

import LandingPageWorkshopsTable from './LandingPageWorkshopsTable';
import SelfPacedProgressTable from './SelfPacedProgressTable';

import style from './landingPage.module.scss';

import './tableStyles.scss';

const getAvailableTabs = (permissions, regionConfigs) => {
  const {
    hideMyFacilitatorCenterTab,
    hideInstructorCenterTab,
    hideRPCenterTab,
    hideWorkshopOrganizerCenterTab,
  } = regionConfigs;

  let tabs = [
    {
      value: 'myPL',
      text: i18n.professionalLearning(),
    },
  ];

  if (!hideMyFacilitatorCenterTab && permissions.includes('facilitator')) {
    tabs.push({
      value: 'myFacilitatorCenter',
      text: i18n.plLandingTabFacilitatorCenter(),
    });
  } else if (
    !hideInstructorCenterTab &&
    (permissions.includes('universal_instructor') ||
      permissions.includes('plc_reviewer'))
  ) {
    // We only want to show the Instructor Center if the user is also not a Facilitator
    tabs.push({
      value: 'instructorCenter',
      text: i18n.plLandingTabInstructorCenter(),
    });
  }

  if (!hideRPCenterTab && permissions.includes('program_manager')) {
    tabs.push({
      value: 'RPCenter',
      text: i18n.plLandingTabRPCenter(),
    });
  }

  if (
    !hideWorkshopOrganizerCenterTab &&
    permissions.includes('workshop_organizer')
  ) {
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
  showDeeperLearning,
  hasEnrolledInWorkshop,
  plCoursesStarted,
  userPermissions,
  joinedStudentSections,
  joinedPlSections,
  coursesAsFacilitator,
  plSectionIds,
  hiddenPlSectionIds,
  // Global Edition Region Configurations
  hideMyFacilitatorCenterTab,
  hideInstructorCenterTab,
  hideRPCenterTab,
  hideWorkshopOrganizerCenterTab,
  hideMyPLWorkshopEnrollmentCelebrationDialog,
  hideMyPLBanner,
  hideMyPLSelfPacedPL,
  hideMyPLJoinSectionArea,
  hideMyPLLandingPageWorkshopsTable,
  hideMyPLStaticRecommendedPL,
  hideMyPLStaticRecommendedPLMidHighBlock,
  hideMyPLStaticRecommendedPLSelfPacedBlock,
  myPLStaticRecommendedPLSelfPacedBlockButtonUrl,
}) {
  const regionTabConfigs = {
    hideMyFacilitatorCenterTab,
    hideInstructorCenterTab,
    hideRPCenterTab,
    hideWorkshopOrganizerCenterTab,
  };
  const availableTabs = getAvailableTabs(userPermissions, regionTabConfigs);
  // The success message will state the title of the workshop the user just enrolled in:
  // - In the case of Build Your Own workshops, it will state the workshop's name.
  // - In the case of any other type of workshop, it will state the workshop's course.
  const [enrollSuccessWorkshopTitle, setEnrollSuccessWorkshopTitle] =
    useState('');
  const [
    enrollSuccessWorkshopSessionInfo,
    setEnrollSuccessWorkshopSessionInfo,
  ] = useState([]);
  const [currentTab, setCurrentTab] = useState(availableTabs[0].value);

  const [workshopsAsParticipant, setWorkshopsAsParticipant] = useState([]);
  const [loadingWorkshopsAsParticipant, setLoadingWorkshopsAsParticipant] =
    useState(false);
  const [loadingWorkshopsAsFacilitator, setLoadingWorkshopsAsFacilitator] =
    useState(false);
  const [workshopsAsFacilitator, setWorkshopsAsFacilitator] = useState([]);
  const [loadingWorkshopsAsOrganizer, setLoadingWorkshopsAsOrganizer] =
    useState(false);
  const [workshopsAsOrganizer, setWorkshopsAsOrganizer] = useState([]);
  const [
    loadingWorkshopsAsProgramManager,
    setLoadingWorkshopsAsProgramManager,
  ] = useState(false);
  const [workshopsAsProgramManager, setWorkshopsAsProgramManager] = useState(
    []
  );

  const headerContainerStyles =
    availableTabs.length > 1
      ? style.headerWithTabsContainer
      : style.headerWithoutTabsContainer;
  const joinedPlSectionsStyling =
    joinedPlSections?.length > 0 ? '' : style.joinedPlSectionsWithNoSections;

  // Load successful enrollment dialog info if user was redirected here after successfully enrolling
  useEffect(() => {
    setUpWorkshopEnrollSuccessContent();
  }, []);

  // Load PL section into redux and fetch applicable workshop info
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(asyncLoadSectionData());
    dispatch(asyncLoadCoteacherInvite());

    const fetchParticipantData = async () => {
      setLoadingWorkshopsAsParticipant(true);
      try {
        const response = await fetch('/api/v1/pd/workshops_user_enrolled_in', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': await getAuthenticityToken(),
          },
        });

        setLoadingWorkshopsAsParticipant(false);
        if (response.ok) {
          const jsonData = await response.json();
          setWorkshopsAsParticipant(jsonData);
        }
      } catch (error) {
        setLoadingWorkshopsAsParticipant(false);
        console.error('Error fetching participant data:', error);
      }
    };
    fetchParticipantData();

    if (userPermissions.includes('facilitator')) {
      const fetchFacilitatorData = async () => {
        setLoadingWorkshopsAsFacilitator(true);
        try {
          const response = await fetch(
            'professional-learning/workshops_as_facilitator_for_pl_page',
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': await getAuthenticityToken(),
              },
            }
          );

          setLoadingWorkshopsAsFacilitator(false);
          if (response.ok) {
            const jsonData = await response.json();
            setWorkshopsAsFacilitator(jsonData.workshops_as_facilitator);
          }
        } catch (error) {
          setLoadingWorkshopsAsFacilitator(false);
          console.error('Error fetching facilitator data:', error);
        }
      };

      fetchFacilitatorData();
    }

    if (userPermissions.includes('workshop_organizer')) {
      const fetchWorkshopOrganizerData = async () => {
        try {
          setLoadingWorkshopsAsOrganizer(true);
          const response = await fetch(
            'professional-learning/workshops_as_organizer_for_pl_page',
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': await getAuthenticityToken(),
              },
            }
          );

          setLoadingWorkshopsAsOrganizer(false);
          if (response.ok) {
            const jsonData = await response.json();
            setWorkshopsAsOrganizer(jsonData.workshops_as_organizer);
          }
        } catch (error) {
          setLoadingWorkshopsAsOrganizer(false);
          console.error('Error fetching workshop organizer data:', error);
        }
      };

      fetchWorkshopOrganizerData();
    }

    if (userPermissions.includes('program_manager')) {
      const fetchProgramManagerWorkshops = async () => {
        setLoadingWorkshopsAsProgramManager(true);
        try {
          const response = await fetch(
            'professional-learning/workshops_as_program_manager_for_pl_page',
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': await getAuthenticityToken(),
              },
            }
          );

          setLoadingWorkshopsAsProgramManager(false);
          if (response.ok) {
            const jsonData = await response.json();
            setWorkshopsAsProgramManager(jsonData.workshops_as_program_manager);
          }
        } catch (error) {
          setLoadingWorkshopsAsProgramManager(false);
          console.error('Error fetching program manager data:', error);
        }
      };

      fetchProgramManagerWorkshops();
    }
  }, [dispatch, userPermissions]);

  const setUpWorkshopEnrollSuccessContent = () => {
    // If a user was sent here after successfully enrolling in a workshop, the one field guaranteed to have
    // been set in sessionStorage is 'workshopCourse' (since a workshop must have a course) so we can use
    // its presence to determine whether to log the WORKSHOP_ENROLLMENT_COMPLETED_EVENT event or not.
    const workshopCourse = sessionStorage.getItem('workshopCourse', null);
    if (!workshopCourse) {
      return '';
    }

    const workshopName = sessionStorage.getItem('workshopName', null);
    setEnrollSuccessWorkshopSessionInfo(
      JSON.parse(sessionStorage.getItem('sessionTimeInfo', null)) ?? []
    );

    analyticsReporter.sendEvent(EVENTS.WORKSHOP_ENROLLMENT_COMPLETED_EVENT, {
      'regional partner': sessionStorage.getItem('rpName', null),
      'workshop id': sessionStorage.getItem('workshopId', null),
      'workshop course': workshopCourse,
      'workshop subject': sessionStorage.getItem('workshopSubject', null),
      'workshop format': sessionStorage.getItem('workshopFormat', null),
    });
    [
      'workshopId',
      'workshopCourse',
      'workshopSubject',
      'workshopName',
      'workshopFormat',
      'sessionTimeInfo',
      'rpName',
    ].forEach(sessionKey => sessionStorage.removeItem(sessionKey));

    setEnrollSuccessWorkshopTitle(
      !!workshopName ? workshopName : workshopCourse
    );
  };

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
      !hasEnrolledInWorkshop && plCoursesStarted?.length === 0;

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
    const actionBlocks = [];

    if (!hideMyPLStaticRecommendedPLMidHighBlock) {
      actionBlocks.push({
        overline: i18n.plLandingStaticPLMidHighOverline(),
        imageUrl: pegasus('/images/pl-page-educator-support.png'),
        heading: i18n.plLandingStaticPLMidHighHeading(),
        description: i18n.plLandingStaticPLMidHighDesc(),
        buttons: [
          {
            color: 'purple',
            url: '/professional-learning/workshops',
            text: i18n.plLandingStaticPLMidHighButton(),
          },
        ],
      });
    }

    if (!hideMyPLStaticRecommendedPLSelfPacedBlock) {
      actionBlocks.push({
        overline: i18n.plLandingStaticPLSelfPacedOverline(),
        imageUrl: pegasus('/images/fill-448x280/admins-page-pl.png'),
        heading: i18n.plLandingStaticPLSelfPacedHeading(),
        description: i18n.plLandingStaticPLSelfPacedDesc(),
        buttons: [
          {
            color: 'purple',
            url: pegasus(
              myPLStaticRecommendedPLSelfPacedBlockButtonUrl ||
                '/educate/professional-development-online'
            ),
            text: i18n.plLandingStaticPLSelfPacedButton(),
          },
        ],
      });
    }

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
      landingPageCourses.push({
        name: 'CSF',
        urlSlug: 'computer-science-fundamentals',
      });
    }
    if (coursesAsFacilitator.includes(COURSE_CSD)) {
      landingPageCourses.push({
        name: 'CSD',
        urlSlug: 'computer-science-discoveries',
      });
    }
    if (coursesAsFacilitator.includes(COURSE_CSP)) {
      landingPageCourses.push({
        name: 'CSP',
        urlSlug: 'computer-science-principles',
      });
    }
    if (coursesAsFacilitator.includes(COURSE_CSA)) {
      landingPageCourses.push({
        name: 'CSA',
        urlSlug: 'computer-science-a',
      });
    }
    if (coursesAsFacilitator.includes(COURSE_AIF)) {
      landingPageCourses.push({
        name: 'AIF',
        urlSlug: 'ai-fundamentals',
      });
    }
    landingPageCourses.forEach(course => {
      allResources.push({
        headingText: i18n.plSectionsFacilitatorResourcesTitle({
          course_name: course.name,
        }),
        descriptionText: i18n.plSectionsFacilitatorResourcesDesc({
          course_name: course.name,
        }),
        buttonText: i18n.plSectionsFacilitatorResourcesButton({
          course_name: course.name,
        }),
        buttonUrl: `/professional-learning/facilitator/${course.urlSlug}`,
      });
    });

    if (showDeeperLearning) {
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
        headingText: i18n.plSectionsWorkshopTitle(),
        descriptionText: i18n.plSectionsWorkshopDesc(),
        buttonText: i18n.plSectionsWorkshopButton(),
        buttonUrl: '/pd/workshop_dashboard',
      },
      {
        headingText: i18n.plSectionsRegionalPartnerPlaybookTitle(),
        descriptionText: i18n.plSectionsRegionalPartnerPlaybookDesc(),
        buttonText: i18n.plSectionsRegionalPartnerPlaybookButton(),
        buttonUrl: '/professional-learning/regional-partner/playbook',
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
        {!hideMyPLWorkshopEnrollmentCelebrationDialog &&
          enrollSuccessWorkshopTitle && (
            <WorkshopEnrollmentCelebrationDialog
              workshopTitle={enrollSuccessWorkshopTitle}
              workshopSessionInfo={enrollSuccessWorkshopSessionInfo}
              onClose={() => setEnrollSuccessWorkshopTitle('')}
            />
          )}
        {!hideMyPLBanner && RenderBanner()}
        {!hideMyPLSelfPacedPL &&
          plCoursesStarted?.length >= 1 &&
          RenderSelfPacedPL()}
        {!hideMyPLJoinSectionArea && (
          <div className={joinedPlSectionsStyling}>
            <JoinSectionArea
              initialJoinedStudentSections={joinedStudentSections}
              initialJoinedPlSections={joinedPlSections}
              isTeacher={true}
              isPlSections={true}
            />
          </div>
        )}
        {!hideMyPLLandingPageWorkshopsTable && (
          <LandingPageWorkshopsTable
            workshops={workshopsAsParticipant}
            isLoading={loadingWorkshopsAsParticipant}
            tableHeader={i18n.myWorkshops()}
            participantView
          />
        )}
        {!hideMyPLStaticRecommendedPL && (
          <section>
            <Heading2>{i18n.plLandingRecommendedHeading()}</Heading2>
            {RenderStaticRecommendedPL()}
          </section>
        )}
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
        <LandingPageWorkshopsTable
          workshops={workshopsAsFacilitator}
          isLoading={loadingWorkshopsAsFacilitator}
          tableHeader={i18n.inProgressAndUpcomingWorkshops()}
          participantView={false}
        />
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
        <LandingPageWorkshopsTable
          workshops={workshopsAsProgramManager}
          isLoading={loadingWorkshopsAsProgramManager}
          tableHeader={i18n.inProgressAndUpcomingWorkshops()}
          participantView={false}
        />
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
        <LandingPageWorkshopsTable
          workshops={workshopsAsOrganizer}
          isLoading={loadingWorkshopsAsOrganizer}
          tableHeader={i18n.inProgressAndUpcomingWorkshops()}
          participantView={false}
        />
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

export const RegionalLandingPage = props => (
  <GlobalEditionWrapper
    component={LandingPage}
    componentId="LandingPage"
    props={props}
  />
);

export default connect(state => ({
  plSectionIds: state.teacherSections.plSectionIds,
  hiddenPlSectionIds: hiddenPlSectionIds(state),
}))(RegionalLandingPage);

LandingPage.propTypes = {
  lastWorkshopSurveyUrl: PropTypes.string,
  lastWorkshopSurveyCourse: PropTypes.string,
  showDeeperLearning: PropTypes.bool,
  hasEnrolledInWorkshop: PropTypes.bool,
  plCoursesInstructed: PropTypes.array,
  plCoursesStarted: PropTypes.array,
  userPermissions: PropTypes.arrayOf(PropTypes.string),
  joinedStudentSections: shapes.participantSections,
  joinedPlSections: shapes.participantSections,
  coursesAsFacilitator: PropTypes.arrayOf(PropTypes.string),
  plSectionIds: PropTypes.arrayOf(PropTypes.number),
  hiddenPlSectionIds: PropTypes.arrayOf(PropTypes.number),
  hideMyFacilitatorCenterTab: PropTypes.bool,
  hideInstructorCenterTab: PropTypes.bool,
  hideRPCenterTab: PropTypes.bool,
  hideWorkshopOrganizerCenterTab: PropTypes.bool,
  hideMyPLWorkshopEnrollmentCelebrationDialog: PropTypes.bool,
  hideMyPLBanner: PropTypes.bool,
  hideMyPLSelfPacedPL: PropTypes.bool,
  hideMyPLJoinSectionArea: PropTypes.bool,
  hideMyPLLandingPageWorkshopsTable: PropTypes.bool,
  hideMyPLStaticRecommendedPL: PropTypes.bool,
  hideMyPLStaticRecommendedPLMidHighBlock: PropTypes.bool,
  hideMyPLStaticRecommendedPLSelfPacedBlock: PropTypes.bool,
  myPLStaticRecommendedPLSelfPacedBlockButtonUrl: PropTypes.string,
};
