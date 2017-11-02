class Api::V1::SchoolAutocomplete < AutocompleteHelper
  # The minimum query length.
  MIN_QUERY_LENGTH = 4

  # Queries the schools lookup table for schools that match the user-defined
  # search criteria.
  # @param query [String] the user-define query string
  # @param limit [int] the maximum number of results to return
  # @return [Array] an array of JSON formatted schools
  def self.get_matches(query, limit)
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
  def self.search_by_zip?(query)
    return !!(query =~ /^(\d{,5}|(\d{5}-\d{,4}))$/)
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
