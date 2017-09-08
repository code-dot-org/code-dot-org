module SchoolAutocomplete

  def self.get_suggestions(q, limit)
    schools = School.where("name LIKE ? or city LIKE ?", "%#{q}%", "#{q}%").order(:name, :id).limit(limit)
    serialized_schools = schools.map do |school|
      Api::V1::SchoolAddressSerializer.new(school).attributes
    end
    return serialized_schools
  end

end
