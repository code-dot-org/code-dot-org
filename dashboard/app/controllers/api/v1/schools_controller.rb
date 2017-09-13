require 'singleton'
require 'triez'

class Api::V1::SchoolsController < ApplicationController

  # GET /api/v1/school/<school_district_id>/<school_type>
  def index
    schools = School.where(school_district_id: params[:school_district_id], school_type: params[:school_type])
    serialized_schools = schools.map do |school|
      Api::V1::SchoolSerializer.new(school).attributes
    end
    render json: serialized_schools
  end

  # GET /dashboardapi/v1/schoolsearch/:q/:limit
  def search
    query = params.require(:q)
    limit = [40, Integer(params[:limit])].min
    render json: Autocomplete.instance.get_matches(query, limit)
  end

  #
  # Helper for auto-complete search API.
  #
  class Autocomplete
    include Singleton

    def initialize
      @schools = Triez.new value_type: :object
      for i in 1...((School.count/3000.0).ceil.to_i+1)
        School.order(:name, :id).page(i).per(3000).map do |school|
          key = "#{school[:name]} #{school[:city]}".downcase
          @schools.change_all(:suffix, key) {school}
        end
      end
    end

    def get_matches(query, limit)
      matches = Array.new
      if query.length >= 3
        @schools.search_with_prefix(query.downcase) do |_, school|
          matches.push(Serializer.new(school).attributes)
        end
        #matches.sort { |a, b| a[:name] =~ /^#{query}/ <=> b[:name] =~ /^#{query}/ }
      end
      results = matches.first(limit) do |school|
        school
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

end
