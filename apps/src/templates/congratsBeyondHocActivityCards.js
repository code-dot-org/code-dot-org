import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

const CSFExpress = {
  title: "CSF Express",
  description: "",
  link: pegasus(`/educate/curriculum/express-course`),
  image: "csf-express"
};

const CreateAccount = {
  title: "Create an Account",
  description: "",
  link: pegasus(`/educate/curriculum/express-course`),
  image: "create-account"
};

const AnotherHoC = {
  title: "Another HoC",
  description: "",
  link: "/applab",
  image: "another-hoc"
};

const ApplabTutorial = {
  title: "Applab Tutorial",
  description: "",
  link: "/applab",
  image: "applab-tutorial"
};

const ApplabMarketing = {
  title: "Applab Tutorial",
  description: "",
  link: "/applab",
  image: "applab-marketing"
};

const ApplabProject = {
  title: "Applab Project",
  description: "",
  link: "/applab",
  image: "applab-project"
};

const OldMinecraft = {
  title: "Minecraft Education",
  description: "",
  link: "/minecraft",
  image: "old-minecraft"
};

const NewMinecraft = {
  title: "Minecraft Education",
  description: "",
  link: "/minecraft",
  image: "new-minecraft",
  MCShareLink: ""
};

export const cardSets = {
  'pre2017MinecraftCards' : [
    CSFExpress,
    ApplabTutorial,
    OldMinecraft
  ],
  'newMinecraftCards' : [
    CSFExpress,
    ApplabTutorial,
    NewMinecraft
  ],
  'signedInApplabCards' : [
    ApplabProject,
    ApplabMarketing,
    AnotherHoC
  ],
  'signedOutApplabCards' : [
    ApplabProject,
    ApplabMarketing,
    CreateAccount
  ],
  'signedInDefaultCards' : [
    CSFExpress,
    ApplabTutorial,
    AnotherHoC
  ],
  'signedOutDefaultCards' : [
    CSFExpress,
    ApplabTutorial,
    CreateAccount
  ]
};
