require_relative '../../i18n_script_utils'

Dir[File.expand_path('../course_offerings/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Dashboard
      module CourseOfferings
        DIR_NAME = 'dashboard'.freeze
        FILE_NAME = 'course_offerings.json'.freeze
        I18N_SOURCE_FILE_PATH = CDO.dir(I18N_SOURCE_DIR, DIR_NAME, FILE_NAME).freeze

        def self.sync_in
          SyncIn.perform
        end

        def self.sync_out
          SyncOut.perform
        end
      end
    end
  end
end
