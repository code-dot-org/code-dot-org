require 'singleton'
require 'triez'

class SchoolAutocomplete
  include Singleton

  def initialize
    @schools = Triez.new value_type: :object
    School.all.each do |school|
      key = "#{school[:name]} #{school[:city]} #{school[:zip]}".downcase
      @schools.change_all(:suffix, key) {school}
    end
  end

  def get_matches(query, limit)
    results = Array.new
    if query.length >= 3
      @schools.search_with_prefix(query.downcase, limit: limit) do |_, school|
        results.push(Serializer.new(school).attributes)
      end
    end
    return results
  end

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
