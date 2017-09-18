import i18n from "@cdo/locale";

export const howManyStudents = [
  "",
  i18n.none(),
  i18n.some(),
  i18n.all(),
  i18n.iDontKnow()
];

export const roleOptions = [
  "",
  i18n.teacher(),
  i18n.administrator(),
  i18n.parent(),
  i18n.volunteer(),
  i18n.other(),
];

export const courseTopics = [{
  name: "topic_blocks_b",
  label: i18n.censusBlockBased()
},
{
  name: "topic_text_b",
  label: i18n.censusTextBased()
},
{
  name: "topic_robots_b",
  label: i18n.censusPhysicalComputing()
},
{
  name: "topic_internet_b",
  label: i18n.censusInternet()
},
{
  name: "topic_security_b",
  label: i18n.censusCybersecurity()
},
{
  name: "topic_data_b",
  label: i18n.censusDataAnalysis()
},
{
  name: "topic_web_design_b",
  label: i18n.censusWebDesign()
},
{
  name: "topic_game_design_b",
  label: i18n.censusGameDesign()
},
{
  name: "topic_other_b",
  label: i18n.censusOtherDescribe()
},
{
  name: "topic_dont_know_b",
  label: i18n.iDontKnow()
}
];

export const frequencyOptions = [
  "",
  i18n.censusFrequency1(),
  i18n.censusFrequency1to3(),
  i18n.censusFrequency3plus(),
  i18n.iDontKnow()
];
