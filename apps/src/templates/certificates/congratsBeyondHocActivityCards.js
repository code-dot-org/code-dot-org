import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import i18n from '@cdo/locale';

const CSFExpress = {
  title: i18n.csfExpressTitle(),
  description: i18n.csfExpressDesc(),
  link: '/s/express',
  image: 'csf-express',
  buttonText: i18n.csfButton()
};

const CSFAccelerated = {
  title: i18n.csfAcceleratedTitle(),
  description: i18n.csfAcceleratedDesc(),
  link: '/s/20-hour',
  image: 'csf-express',
  buttonText: i18n.csfButton()
};

const CourseCatalog = {
  title: i18n.courseCatalogTitle(),
  description: i18n.courseCatalogDescription(),
  link: '/courses',
  image: 'course-catalog',
  buttonText: i18n.courseCatalogButton()
};

const CreateAccount = {
  title: i18n.createAccount(),
  description: i18n.createAccountDesc(),
  link: '/users/sign_up',
  image: 'create-account',
  buttonText: i18n.createAccount()
};

const CreateAccountApplab = {
  title: i18n.createAccount(),
  description: i18n.createAccountApplabDesc(),
  link: '/users/sign_up',
  image: 'create-account',
  buttonText: i18n.createAccount()
};

const AnotherHoC = {
  title: i18n.anotherHoCTitle(),
  description: i18n.anotherHoCDesc(),
  link: pegasus('/hourofcode/overview'),
  image: 'another-hoc',
  buttonText: i18n.anotherHoCButton()
};

const ApplabTutorial = {
  title: i18n.applabTutorialTitle(),
  description: i18n.applabTutorialDesc(),
  link: '/s/applab-intro/reset',
  image: 'applab-tutorial',
  buttonText: i18n.applabTutorialButton()
};

const ApplabMarketing = {
  title: i18n.applabMarketingTitle(),
  description: i18n.applabMarketingDesc(),
  link: pegasus('/applab'),
  image: 'applab-marketing',
  buttonText: i18n.applabMarketingButton()
};

const ApplabProject = {
  title: i18n.applabProjectTitle(),
  description: i18n.applabProjectDesc(),
  link: '/projects/applab/new',
  image: 'applab-project',
  buttonText: i18n.applabProjectButton()
};

const OldMinecraft = {
  title: i18n.pre2017MinecraftTitle(),
  description: i18n.pre2017MinecraftDesc(),
  link: 'https://education.minecraft.net/hour-of-code',
  image: 'old-minecraft',
  buttonText: i18n.pre2017MinecraftButton()
};

const HeroMinecraft = {
  title: i18n.minecraft2017Title(),
  description: i18n.minecraft2017Desc(),
  link: 'https://education.minecraft.net/hour-of-code',
  image: 'hero-minecraft',
  buttonText: i18n.minecraft2017Button(),
  MCShareLink: ''
};

// This card is displayed when you complete the Code.org MC Aquatic tutorial.
// The takes you to the Microsoft Minecraft page.
const AquaticMinecraft = {
  title: i18n.minecraftAquaticTitle(),
  description: i18n.minecraftAquaticDesc(),
  link: 'http://aka.ms/hoc2018',
  image: 'aquatic-minecraft',
  buttonText: i18n.minecraftAquaticButton()
};

// This card is displayed to promote the MC Aquatic tutorial after finishing
// another Hour of Code activity.
const AquaticMinecraftPromo = {
  title: i18n.minecraftAquaticPromoTitle(),
  description: i18n.minecraftAquaticPromoDesc(),
  link: '/s/aquatic/reset',
  image: 'aquatic-minecraft',
  buttonText: i18n.minecraftAquaticPromoButton()
};

const DanceParty = {
  title: i18n.dancePartyTitle(),
  description: i18n.dancePartyDesc(),
  link: '/s/dance-2019/reset',
  image: 'dance-party-sloth-2019',
  buttonText: i18n.dancePartyButton()
};

const DancePartyFollowUp = {
  title: i18n.danceAfterPartyTitle(),
  description: i18n.danceAfterPartyDesc(),
  link: '/s/dance-extras-2019/reset',
  image: 'dance-party-2-2019',
  buttonText: i18n.danceAfterPartyButton()
};

export const cardSets = {
  pre2017MinecraftCards: [CSFExpress, ApplabTutorial, OldMinecraft],
  youngerThan13Pre2017MinecraftCards: [CSFExpress, AnotherHoC, OldMinecraft],
  nonEnglishPre2017MinecraftCards: [
    CSFAccelerated,
    CourseCatalog,
    OldMinecraft
  ],
  heroMinecraftCards: [CSFExpress, ApplabTutorial, HeroMinecraft],
  youngerThan13HeroMinecraftCards: [CSFExpress, AnotherHoC, HeroMinecraft],
  nonEnglishHeroMinecraftCards: [CSFAccelerated, CourseCatalog, HeroMinecraft],
  aquaticMinecraftCards: [CSFExpress, ApplabTutorial, AquaticMinecraft],
  youngerThan13AquaticMinecraftCards: [
    CSFExpress,
    AnotherHoC,
    AquaticMinecraft
  ],
  nonEnglishAquaticMinecraftCards: [
    CSFAccelerated,
    CourseCatalog,
    AquaticMinecraft
  ],
  signedInApplabCards: [ApplabProject, ApplabMarketing, AnotherHoC],
  signedOutApplabCards: [ApplabMarketing, CreateAccountApplab, ApplabProject],
  signedInDefaultCards: [CSFExpress, ApplabTutorial, AnotherHoC],
  youngerThan13DefaultCards: [CSFExpress, DanceParty, AnotherHoC],
  signedInNonEnglishDefaultCards: [CSFAccelerated, CourseCatalog, AnotherHoC],
  signedOutDefaultCards: [CSFExpress, DanceParty, CreateAccount],
  signedOutNonEnglishDefaultCards: [
    CSFAccelerated,
    CourseCatalog,
    CreateAccount
  ],
  signedInEnglishDancePartyCards: [DancePartyFollowUp, CSFExpress, AnotherHoC],
  signedInNonEnglishDancePartyCards: [
    DancePartyFollowUp,
    CSFAccelerated,
    AnotherHoC
  ],
  signedOutEnglishDancePartyCards: [
    DancePartyFollowUp,
    CSFExpress,
    CreateAccount
  ],
  signedOutNonEnglishDancePartyCards: [
    DancePartyFollowUp,
    CSFAccelerated,
    CreateAccount
  ],
  // Use these cards if Dance Party Extras is hidden with DCDO.
  signedInEnglishDancePartyAquaticCards: [
    AquaticMinecraftPromo,
    CSFExpress,
    AnotherHoC
  ],
  signedInNonEnglishDancePartyAquaticCards: [
    AquaticMinecraftPromo,
    CSFAccelerated,
    AnotherHoC
  ],
  signedOutEnglishDancePartyAquaticCards: [
    AquaticMinecraftPromo,
    CSFExpress,
    CreateAccount
  ],
  signedOutNonEnglishDancePartyAquaticCards: [
    AquaticMinecraftPromo,
    CSFAccelerated,
    CreateAccount
  ]
};
