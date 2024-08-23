import {marketing, studio} from '@cdo/apps/lib/util/urlHelpers';
import i18n from '@cdo/locale';

export const TeacherGradeBandCards = [
  {
    linkId: 'course-block-grade-band-elementary',
    linkClass: 'linktag',
    heading: i18n.courseBlocksGradeBandsElementary(),
    description: i18n.courseBlocksGradeBandsElementaryDescription(),
    buttonText: i18n.courseBlocksGradeBandsElementaryButton(),
    path: marketing('/educate/curriculum/elementary-school'),
  },
  {
    linkId: 'course-block-grade-band-middle',
    linkClass: 'linktag',
    heading: i18n.courseBlocksGradeBandsMiddle(),
    description: i18n.courseBlocksGradeBandsMiddleDescription(),
    buttonText: i18n.courseBlocksGradeBandsMiddleButton(),
    path: marketing('/educate/curriculum/middle-school'),
  },
  {
    linkId: 'course-block-grade-band-high',
    linkClass: 'linktag',
    heading: i18n.courseBlocksGradeBandsHigh(),
    description: i18n.courseBlocksGradeBandsHighDescription(),
    buttonText: i18n.courseBlocksGradeBandsHighButton(),
    path: marketing('/educate/curriculum/high-school'),
  },
];

export const InternationalGradeBandCards = [
  {
    linkId: 'course-block-international-grade-band-4-10',
    linkClass: 'linktag',
    heading: i18n.courseBlocksInternationalGradeBandsElementary(),
    description:
      i18n.courseBlocksInternationalGradeBandsElementaryDescription(),
    buttonText: i18n.courseBlocksInternationalGradeBandsElementaryButton(),
    path: marketing('/educate/curriculum/elementary-school'),
  },
  {
    linkId: 'course-block-international-grade-band-10-14',
    linkClass: 'linktag',
    heading: i18n.courseBlocksInternationalGradeBandsMiddle(),
    description: i18n.courseBlocksInternationalGradeBandsMiddleDescription(),
    buttonText: i18n.courseBlocksInternationalGradeBandsMiddleButton(),
    path: marketing('/educate/curriculum/middle-school'),
  },
  {
    linkId: 'course-block-international-grade-band-12-18',
    linkClass: 'linktag',
    heading: i18n.courseBlocksInternationalGradeBandsHigh(),
    description: i18n.courseBlocksInternationalGradeBandsHighDescription(),
    buttonText: i18n.courseBlocksInternationalGradeBandsHighButton(),
    path: marketing('/educate/curriculum/high-school'),
  },
];

export const StudentGradeBandCards = [
  {
    heading: i18n.courseBlocksGradeBandsK5(),
    description: i18n.courseBlocksGradeBandsK5Description(),
    buttonText: i18n.courseBlocksGradeBandsK5Button(),
    path: marketing('/student/elementary'),
  },
  {
    heading: i18n.courseBlocksGradeBands612(),
    description: i18n.courseBlocksGradeBands612Description(),
    buttonText: i18n.courseBlocksGradeBands612Button(),
    path: marketing('/student/middle-high'),
  },
  {
    heading: i18n.courseBlocksGradeBandsUniversity(),
    description: i18n.courseBlocksGradeBandsUniversityDescription(),
    buttonText: i18n.courseBlocksGradeBandsUniversityButton(),
    path: marketing('/beyond'),
  },
];

export const ToolsCards = [
  {
    heading: i18n.courseBlocksToolsAppLab(),
    description: i18n.courseBlocksToolsAppLabDescription(),
    buttonText: i18n.learnMoreApplab(),
    path: marketing('/applab'),
  },
  {
    heading: i18n.courseBlocksToolsGameLab(),
    description: i18n.courseBlocksToolsGameLabDescription(),
    buttonText: i18n.learnMoreGamelab(),
    path: marketing('/gamelab'),
  },
  {
    heading: i18n.courseBlocksToolsWebLab(),
    description: i18n.courseBlocksToolsWebLabDescription(),
    buttonText: i18n.learnMoreWeblab(),
    path: marketing('/weblab'),
  },
  {
    heading: i18n.csJourneys(),
    callout: i18n.newExclame(),
    description: i18n.csJourneysDescription(),
    buttonText: i18n.learnMoreCsJourneys(),
    path: marketing('/csjourneys'),
  },
  {
    heading: i18n.courseBlocksToolsVideo(),
    description: i18n.courseBlocksToolsVideoDescription(),
    buttonText: i18n.learnMoreToolsVideos(),
    path: marketing('/videos'),
  },
];

export const ToolsAIExtrasCard = [
  {
    heading: i18n.courseBlocksToolsAi(),
    callout: i18n.newExclame(),
    description: i18n.courseBlocksToolsAiDescription(),
    buttonText: i18n.learnMoreAilab(),
    path: studio('/s/aiml'),
  },
];

export const ToolsWidgetsCard = [
  {
    heading: i18n.courseBlocksToolsWidgets(),
    description: i18n.courseBlocksToolsWidgetsDescription(),
    buttonText: i18n.learnMoreWidgets(),
    path: marketing('/widgets'),
  },
];
