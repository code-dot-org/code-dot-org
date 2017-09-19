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

export const frequencyOptions = [
  "",
  i18n.censusFrequency1(),
  i18n.censusFrequency1to3(),
  i18n.censusFrequency3plus(),
  i18n.iDontKnow()
];
