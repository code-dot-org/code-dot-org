class Api::V1::SchoolDistrictAutocomplete < AutocompleteHelper
  # Queries the schools lookup table for schools that match the user-defined
  # search criteria.
  # @param query [String] the user-define query string
  # @param limit [int] the maximum number of results to return
  # @return [Array] an array of JSON formatted schools
  def self.get_matches(query, limit)
    limit = format_limit(limit)
    query = format_query(query)

    return [] if query.length < MIN_WORD_LENGTH + 2

    rows = SchoolDistrict.limit(limit).
      where("MATCH(name,city) AGAINST(? IN BOOLEAN MODE)", query).
      # sanitize_sql_for_order won't be a public method until Rails 5.2
      order(ActiveRecord::Base.send(:sanitize_sql_for_order, ["MATCH(name,city) AGAINST(? IN BOOLEAN MODE) DESC, state, city, name", query]))

    return rows.map do |row|
      Serializer.new(row).attributes
    end
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
