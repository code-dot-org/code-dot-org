import i18n from "@cdo/locale";

export const howManyStudents = [
  {value: "", display: ""},
  {value: "none", display: i18n.none()},
  {value: "some", display: i18n.some()},
  {value: "all", display: i18n.all()},
  {value: "dont_know", display: i18n.iDontKnow()}
];

export const roleOptions = [
  {value: "", display: ""},
  {value: "teacher", display: i18n.teacher()},
  {value: "administrator", display: i18n.administrator()},
  {value: "parent", display: i18n.parent()},
  {value: "volunteer", display: i18n.volunteer()},
  {value: "other", display: i18n.other()}
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
}
];

export const frequencyOptions = [
  {value: "", display: ""},
  {value: "less_than_one", display: i18n.censusFrequency1()},
  {value: "one_to_three", display: i18n.censusFrequency1to3()},
  {value: "three_plus", display: i18n.censusFrequency3plus()},
  {value: "dont_know", display: i18n.iDontKnow()}
];

export const pledge = i18n.censusPledge();
