require 'singleton'

class Api::V1::SchoolAutocomplete
  include Singleton

  # The minimum query length.
  MIN_QUERY_LENGTH = 4

  # Queries the schools lookup table for schools that match the user-defined
  # search criteria.
  # @param query [String] the user-define query string
  # @param limit [int] the maximum number of results to return
  # @return [Array] an array of JSON formatted schools
  def get_matches(query, limit)
    query = query.strip
    return [] if query.length < MIN_QUERY_LENGTH

    schools = School.limit(limit)
    if search_by_zip?(query)
      schools = schools.where("zip LIKE ?", "#{query[0, 5]}%")
    else
      search_string = to_search_string(query)
      schools = schools.
        where("MATCH(name,city) AGAINST(? IN BOOLEAN MODE)", search_string).
        order("MATCH(name,city) AGAINST('#{search_string}' IN BOOLEAN MODE) DESC, state, city, name")
    end

    results = schools.map do |school|
      Serializer.new(school).attributes
    end

    return results
  end

  # Determines if we should perform a search by ZIP code rather than by school
  # name or city.
  # @param query [String] the user-define query string
  # @return [boolean] true if it might be a ZIP, false otherwise
  def search_by_zip?(query)
    return !!(query =~ /^(\d{,5}|(\d{5}-\d{,4}))$/)
  end

  # Formats the query string for boolean full-text search.
  # For instance, if the user-defined query string is 'abc def',
  # the string is reformatted to '+ABC +DEF*'.
  # @see https://dev.mysql.com/doc/refman/5.6/en/fulltext-boolean.html
  # @param query [String] the user-defined query string
  # @return [String] the formatted query string
  def to_search_string(query)
    words = query.strip.split(/\s+/).map do |w|
      w.gsub(/\W/, '').upcase
    end.map(&:presence).compact #.map {|w| "\\\"ST.\\\""} #"\"#{w}\""}
    # Words can contain periods (e..g, "St. Paul" and we need to put the term
    # quotes to make the search work properly and to get those quotes through
    # to the DB we need to escape them. (e.g., St. --> \"St.\")
    # See https://stackoverflow.com/questions/12076780/match-against-foo-bar-with-a-full-stop-period
    return words.empty? ? "" : "+\\\"#{words.join('\\\" +\\\"')}*\\\""
  end

  # JSON serializer used by get_matches.
  class Serializer < ActiveModel::Serializer
    attributes :nces_id, :name, :city, :state, :zip

    def nces_id
      object.id.to_s
    end

    def name
      object.name.titleize
    end

    def city
      object.city.titleize
    end
  end
end
