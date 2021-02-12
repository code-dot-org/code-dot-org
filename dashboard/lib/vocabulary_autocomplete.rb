class VocabularyAutocomplete < AutocompleteHelper
  def self.get_search_matches(query, limit, course_version_id)
    limit = format_limit(limit)

    rows = Vocabulary.limit(limit)
    rows = rows.where(course_version_id: course_version_id)
    return [] if query.length < MIN_WORD_LENGTH
    query = format_query(query)
    rows = rows.
      where("MATCH(word,definition) AGAINST(? in BOOLEAN MODE)", query)
    return rows.map(&:summarize_for_lesson_edit)
  end
end
