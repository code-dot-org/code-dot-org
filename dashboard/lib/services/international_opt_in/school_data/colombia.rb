require_relative 'base'

module Services
  module InternationalOptIn
    module SchoolData
      class Colombia < Base
        def self.required_fields
          %i[school_department school_municipality school_city]
        end

        def self.data
          @data ||= load_json('colombia.json')
        end
      end
    end
  end
end
