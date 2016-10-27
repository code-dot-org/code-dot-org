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

function getTagString(prefix, tagString) {
  if (!tagString) {
    return "";
  }

  const tagToString = {
    length_1hour: "One hour",
    "length_1hour-follow": "One hour with follow-on",
    "length_few-hours": "A few hours",

    subject_science: "Science",
    subject_math: "Math",
    subject_history: "Social Studies",
    subject_la: "Language Arts",
    subject_art: "Art, Design, Media",
    subject_other: "Other",
    "subject_cs-only": "Computer Science only",

    teacher_experience_beginner: "Beginner",
    teacher_experience_comfortable: "Comfortable",

    student_experience_beginner: "Beginner",
    student_experience_comfortable: "Comfortable",

    "activity_type_online-tutorial": "Self-led tutorial",
    "activity_type_lesson-plan": "Lesson plan",

    // todo:
    //international_languages_
  };

  return tagString.split(',').map(tag => tagToString[`${prefix}_${tag}`]).join(', ');
}

/**
 * Given a tutorial item, return the string to render for its details.
 * @param {object} item - A tutorial item.
 * @return {string} - The detail string, e.g. "Grade 4 | C++ | Web" or "Grade 4 | C++".
 */

function getTutorialDetailString(item) {
  const grades = item.string_detail_grades;
  const programming_languages = item.string_detail_programming_languages;
  const platforms = item.string_detail_platforms;

  let result = `${grades} | ${programming_languages}`;
  if (platforms) {
    result = result + ` | ${platforms}`;
  }
  return result;
}

export { getTagString, getTutorialDetailString };
