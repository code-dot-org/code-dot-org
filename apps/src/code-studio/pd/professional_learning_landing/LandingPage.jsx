// My Professional Learning landing page
// studio.code.org/my-professional-learning

import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {connect, useDispatch} from 'react-redux';
import i18n from '@cdo/locale';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import {Heading2} from '@cdo/apps/componentLibrary/typography';
import {EnrolledWorkshops, EnrolledWorkshopsTable} from './EnrolledWorkshops';
import {
  COURSE_CSF,
  COURSE_CSD,
  COURSE_CSP,
  COURSE_CSA,
} from '../workshop_dashboard/workshopConstants';
import SelfPacedProgressTable from './SelfPacedProgressTable';
import HeaderBannerNoImage from '@cdo/apps/templates/HeaderBannerNoImage';
import TwoColumnActionBlock from '@cdo/apps/templates/studioHomepages/TwoColumnActionBlock';
import ActionBlocksWrapper from '@cdo/apps/templates/studioHomepages/ActionBlocksWrapper';
import CoteacherInviteNotification from '@cdo/apps/templates/studioHomepages/CoteacherInviteNotification';
import OwnedSections from '@cdo/apps/templates/teacherDashboard/OwnedSections';
import SetUpSections from '@cdo/apps/templates/studioHomepages/SetUpSections';
import AddSectionDialog from '@cdo/apps/templates/teacherDashboard/AddSectionDialog';
import JoinSectionArea from '@cdo/apps/templates/studioHomepages/JoinSectionArea';
import BorderedCallToAction from '@cdo/apps/templates/studioHomepages/BorderedCallToAction';
import style from './landingPage.module.scss';
import './tableStyles.scss';
import Tabs from '@cdo/apps/componentLibrary/tabs';
import {
  asyncLoadSectionData,
  asyncLoadCoteacherInvite,
  hiddenPlSectionIds,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import shapes from '@cdo/apps/templates/studioHomepages/shapes';

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
  workshopsAsParticipant,
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
  const headerContainerStyles =
    availableTabs.length > 1
      ? style.headerWithTabsContainer
      : style.headerWithoutTabsContainer;

  const showGettingStartedBanner =
    !currentYearApplicationId &&
    workshopsAsParticipant?.length === 0 &&
    plCoursesStarted?.length === 0;

  const joinedPlSectionsStyling =
    joinedPlSections?.length > 0 ? '' : style.joinedPlSectionsWithNoSections;

  // Load PL section info into redux
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(asyncLoadSectionData());
    dispatch(asyncLoadCoteacherInvite());
  }, [dispatch]);

  const RenderGettingStartedBanner = () => (
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
        {showGettingStartedBanner && RenderGettingStartedBanner()}
        {lastWorkshopSurveyUrl && RenderLastWorkshopSurveyBanner()}
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
          <EnrolledWorkshopsTable
            workshops={workshopsAsFacilitator}
            forMyPlPage={true}
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
          <EnrolledWorkshopsTable
            workshops={workshopsAsRegionalPartner}
            forMyPlPage={true}
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
          <EnrolledWorkshopsTable
            workshops={workshopsAsOrganizer}
            forMyPlPage={true}
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
  workshopsAsParticipant: PropTypes.array,
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
