require 'json'

require_relative '../../../../dashboard/config/environment'
require_relative '../../i18n_script_utils'

module I18n
  module Resources
    module Dashboard
      module CourseOfferings
        I18N_SOURCE_FILE_PATH = CDO.dir(File.join(I18N_SOURCE_DIR, 'dashboard/course_offerings.json')).freeze

        # Aggregate every CourseOffering record's `key` as the translation key, and
        # each record's `display_name` as the translation string.
        def self.sync_in
          puts 'Preparing course offerings'

          course_offerings = {}

          # TODO: Refactor course_offerings data collection
          #   1. Select data in batches of 1k records
          #   2. Fix data sorting
          CourseOffering.all.sort.each do |co|
            course_offerings[co.key] = co.display_name
          end

          File.write(I18N_SOURCE_FILE_PATH, JSON.pretty_generate(course_offerings))
        end
      end
    end
  end
end
