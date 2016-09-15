/**
 * For a comma-separated string of tags, generate a comma-separated string of their friendly
 * names.
 * e.g. Given a prefix of "subject_" and a string of tags of "history,science",
 * generate the readable string "History, Science".  These friendly strings are
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
    length_1_hour: "One hour",
    subject_english: "English",
    subject_history: "History",
    teacher_experience_expert: "Expert",
    teacher_experience_beginner: "Beginner",
    student_experience_expert: "Expert",
    student_experience_beginner: "Beginner",
    activity_type_programming: "Programming tutorial",
    grade_pre: "Pre",
    "grade_2-5": "2-5",
    "grade_6-8": "6-8",
    programming_language_javascript: "JavaScript",
    programming_language_c: "C",
  };

  return tagString.split(',').map(tag => tagToString[`${prefix}_${tag}`]).join(', ');
}

export default getTagString;
