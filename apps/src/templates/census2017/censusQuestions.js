import i18n from "@cdo/locale";

export const CSOptions = [{
  name: "cs_none_b",
  label: i18n.none()
},
{
  name: "hoc_some_b",
  label: i18n.censusHocSome()
},
{
  name: "hoc_all_b",
  label: i18n.censusHocAll()
},
{
  name: "after_school_some_b",
  label: i18n.censusAfterSchoolSome()
},
{
  name: "after_school_all_b",
  label: i18n.censusAfterSchoolAll()
},
{
  name: "ten_hr_some_b",
  label: i18n.census10HourSome()
},
{
  name: "ten_hr_all_b",
  label: i18n.census10HourAll()
},
{
  name: "twenty_hr_some_b",
  label: i18n.census20HourSome()
},
{
  name: "twenty_hr_all_b",
  label: i18n.census20HourAll()
},
{
  name: "other_course_b",
  label: i18n.censusOtherCourse()
},
{
  name: "cs_dont_know_b",
  label: i18n.iDontKnow()
}
];

export const roleOptions = [
  "",
  i18n.teacher(),
  i18n.administrator(),
  i18n.parent(),
  i18n.student(),
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

export const pledge = i18n.censusPledge();
