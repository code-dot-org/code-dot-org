import i18n from '@cdo/tutorialExplorer/locale';
import * as utils from '../utils';


// Sort By dropdown choices for tutorials.
export const TutorialsSortByOptions = utils.makeEnum('popularityrank', 'displayweight');

// Sort By source data field names (from gsheet) for tutorials.
export const TutorialsSortByFieldNames = utils.makeEnum(
  'popularityrank',
  'popularityrank_pre',
  'popularityrank_25',
  'popularityrank_middle',
  'popularityrank_high',
  'displayweight',
  'displayweight_pre',
  'displayweight_25',
  'displayweight_middle',
  'displayweight_high'
);

export function isTutorialSortByFieldNamePopularity(sortByFieldName) {
  return sortByFieldName === 'popularityrank' ||
    sortByFieldName === 'popularityrank_pre' ||
    sortByFieldName === 'popularityrank_25' ||
    sortByFieldName === 'popularityrank_middle' ||
    sortByFieldName === 'popularityrank_high';
}

// Orgname value.
export const TutorialsOrgName = utils.makeEnum('all');

// "do-not-show" string used in the source data as both a tag and in place of an
// organization name.
export const DoNotShow = "do-not-show";

// Code.org's organization name.
export const orgNameCodeOrg = "Code.org";

// Minecraft's organization name.
export const orgNameMinecraft = "Mojang, Microsoft and Code.org";

/**
 * For a comma-separated string of tags, generate a comma-separated string of their friendly
 * names.
 * e.g. Given a prefix of "subject_" and a string of tags of "history,science",
 * generate the readable string "Social Studies, Science".  These friendly strings are
 * stored in the string table as "subject_history" and "subject_science".
 *
 * @param {string} prefix - The prefix applied to the tag in the string table.
 * @param {string} tagString - Comma-separated tags, no spaces.
 */

export function getTagString(prefix, tagString) {
  if (!tagString) {
    return "";
  }

  const tagToString = {
    length_1hour:                     i18n.filterLength1Hour(),
    "length_1hour-follow":            i18n.filterLength1HourFollow(),
    "length_few-hours":               i18n.filterLengthFewHours(),

    subject_science:                  i18n.filterTopicsScience(),
    subject_math:                     i18n.filterTopicsMath(),
    subject_history:                  i18n.filterTopicsHistory(),
    subject_la:                       i18n.filterTopicsLa(),
    subject_art:                      i18n.filterTopicsArt(),
    "subject_cs-only":                i18n.filterTopicsCsOnly(),

    student_experience_beginner:      i18n.filterStudentExperienceBeginner(),
    student_experience_comfortable:   i18n.filterStudentExperienceComfortable(),

    "activity_type_online-tutorial":  i18n.filterActivityTypeOnlineTutorial(),
    "activity_type_lesson-plan":      i18n.filterActivityTypeLessonPlan(),
    "activity_type_robotics":         i18n.filterActivityTypeRobotics()
  };

  return tagString.split(',').map(tag => tagToString[`${prefix}_${tag}`]).filter(str => !!str).join(', ');
}


/**
 * Given a tutorial item, return the string to render for its details.
 * @param {object} item - A tutorial item.
 * @return {string} - The detail string, e.g. "Grade 4 | C++ | Web" or "Grade 4 | C++".
 */

export function getTutorialDetailString(item) {
  const grades = item.string_detail_grades;
  const programming_languages = item.string_detail_programming_languages;
  const platforms = item.string_detail_platforms;

  let result = `${grades} | ${programming_languages}`;
  if (platforms) {
    result = result + ` | ${platforms}`;
  }
  return result;
}


/**
 * Returns whether it detects that it's running on a mobile device.
 */

export function mobileCheck() {

  // Adapted from http://detectmobilebrowsers.com/ with the addition of |android|ipad|playbook|silk as
  // it suggests at http://detectmobilebrowsers.com/about
  // Note that there are two regular expressions in the blob.  The first tests against variable a (the entire
  // user agent) while the second tests against just the first four characters in it.

  var check = false;
  (function (a) {if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) { check = true; } })(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}
