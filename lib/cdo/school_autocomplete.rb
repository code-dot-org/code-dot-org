module SchoolAutocomplete

  #
  # Returns the matching school entries by querying the DB.
  # @param query The search string.
  # @param limit The maximum number of matches to return.
  # @return The matching results.
  #
  def self.get_matches(query, limit)
    schools = School
      .where("name LIKE ? or city LIKE ?", "%#{query}%", "#{query}%")
      .order(:name, :id)
      .limit(limit)
    results = schools.map do |school|
      Serializer.new(school).attributes
    end
    return results
  end

  #
  # A school record JSON serializer.
  #
  class Serializer < ActiveModel::Serializer
    attributes :id, :name, :city, :state, :zip, :school_district_id
    def name
      object.name.titleize
    end
    def city
      object.city.titleize
    end
  end

end
