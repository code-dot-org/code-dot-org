class Api::V1::SchoolNameSuggester

  def suggest(q, limit)
    schools = School.where("name LIKE ? or city LIKE ?", "%#{q}%", "#{q}%").order(:name).limit(limit)
    serialized_schools = schools.map do |school|
      Api::V1::SchoolAddressSerializer.new(school).attributes
    end
    return serialized_schools
  end

end
