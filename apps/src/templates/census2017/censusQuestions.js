import i18n from "@cdo/locale";

export const howManyStudents = [
  {value: "", display: ""},
  {value: "NONE", display: i18n.none()},
  {value: "SOME", display: i18n.some()},
  {value: "ALL", display: i18n.all()},
  {value: "I DON'T KNOW", display: i18n.iDontKnow()}
];

export const roleOptions = [
  {value: "", display: ""},
  {value: "TEACHER", display: i18n.teacher()},
  {value: "ADMINISTRATOR", display: i18n.administrator()},
  {value: "PARENT", display: i18n.parent()},
  {value: "VOLUNTEER", display: i18n.volunteer()},
  {value: "OTHER", display: i18n.other()}
];

export const courseTopics = [{
  name: "topic_blocks",
  label: i18n.censusBlockBased()
},
{
  name: "topic_text",
  label: i18n.censusTextBased()
},
{
  name: "topic_robots",
  label: i18n.censusPhysicalComputing()
},
{
  name: "topic_internet",
  label: i18n.censusInternet()
},
{
  name: "topic_security",
  label: i18n.censusCybersecurity()
},
{
  name: "topic_data",
  label: i18n.censusDataAnalysis()
},
{
  name: "topic_web_design",
  label: i18n.censusWebDesign()
},
{
  name: "topic_game_design",
  label: i18n.censusGameDesign()
}
];

export const frequencyOptions = [
  {value: "", display: ""},
  {value: "LESS THAN ONE HOUR PER WEEK", display: i18n.censusFrequency1()},
  {value: "ONE TO THREE HOURS PER WEEK", display: i18n.censusFrequency1to3()},
  {value: "THREE PLUS HOURS PER WEEK", display: i18n.censusFrequency3plus()},
  {value: "I DON'T KNOW", display: i18n.iDontKnow()}
];

export const pledge = i18n.censusPledge();
