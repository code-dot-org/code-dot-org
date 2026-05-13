require 'json'
require 'cdo/honeybadger'

module Services
  module InternationalOptIn
    module SchoolData
      class Base
        SCHOOL_DATA_DIR = Rails.root.join('config', 'international_opt_in', 'school_data')

        def self.load_json(filename)
          full_path = SCHOOL_DATA_DIR.join(filename)
          JSON.parse(File.read(full_path)).freeze
        rescue Errno::ENOENT, JSON::ParserError => exception
          Honeybadger.notify(
            exception,
            error_message: "Error loading JSON for #{full_path}: #{exception.message}"
          )
          {}
        end
      end
    end
  end
end
