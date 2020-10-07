class ResourcesController < ApplicationController
  # GET /resourcesearch/:q/:limit
  def search
    render json: get_search_matches(params[:q], params[:limit])
  end

  private

  def get_query_terms(query)
    query.strip.split(/\s+|\W+/).map do |w|
      w.upcase.presence
    end.compact
  end

  def format_limit(limit)
    return [1, [limit.to_i, 50].min].max
  end

  def format_query(query)
    words = get_query_terms query
    # Don't filter the last word if it is short since we will
    # append it with * for a wildcard search.
    words = words.select.with_index do |w, i|
      i == words.length - 1 || w.length >= MIN_WORD_LENGTH
    end

    return words.empty? ? "" : "+#{words.join(' +')}*"
  end

  def get_search_matches(query, limit)
    limit = format_limit(limit)

    rows = Resource.limit(limit)
    puts rows
    query = format_query(query)
    return [] if query.length < 2
    rows = rows.
      where("MATCH(name,url) AGAINST(? in BOOLEAN MODE)", query)
    return rows.map(&:attributes)
  end
end
