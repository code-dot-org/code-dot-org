require_relative 'base'

module Services
  module InternationalOptIn
    module SchoolData
      class Uzbekistan < Base
        def self.required_fields
          %i[school_department school_municipality]
        end

        def self.data
          @data ||= load_json('uzbekistan.json')
        end
      end
    end
  end
end
