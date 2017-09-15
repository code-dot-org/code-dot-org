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
    matches = Array.new
    if query.length >= 3
      @schools.search_with_prefix(query.downcase) do |_, school|
        matches.push(Serializer.new(school).attributes)
        #matches.push(school)
      end
      #matches.sort { |a, b| a[:name] =~ /^#{query}/ <=> b[:name] =~ /^#{query}/ }
    end
    results = matches.first(limit) do |school|
      school
      #Serializer.new(school).attributes
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
