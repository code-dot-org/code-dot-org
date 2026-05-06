class JSONVideosAutocomplete < AutocompleteHelper
  def self.get_search_matches(query, limit)
    limit = format_limit(limit)
    return [] if query.length < MIN_WORD_LENGTH
    sanitized = ActiveRecord::Base.sanitize_sql_like(query)
    JSONVideo.limit(limit).where("json_videos.key LIKE ?", "%#{sanitized}%").map(&:summarize)
  end
end
