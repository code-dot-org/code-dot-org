require_relative 'base'

module Services
  module InternationalOptIn
    module SchoolData
      class Chile < Base
        def self.required_fields
          %i[school_department school_commune school_id]
        end

        def self.data
          @data ||= load_json('chile.json')
        end
      end
    end
  end
end
