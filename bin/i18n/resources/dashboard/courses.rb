require_relative '../../i18n_script_utils'

Dir[File.expand_path('../courses/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Dashboard
      module Courses
        # Currently, csd is the only fully translatable course that has resources in this directory
        TRANSLATABLE_COURSES = %w[csd].freeze

        DIR_NAME = 'dashboard'.freeze
        FILE_NAME = 'courses.yml'.freeze
        ORIGIN_I18N_FILE_PATH = CDO.dir('dashboard/config/locales/courses.en.yml').freeze
        I18N_SOURCE_FILE_PATH = CDO.dir(I18N_SOURCE_DIR, DIR_NAME, FILE_NAME).freeze
        I18N_BACKUP_FILE_PATH = CDO.dir(I18N_ORIGINAL_DIR, DIR_NAME, FILE_NAME).freeze

        REDACT_PLUGINS = %w[resourceLink vocabularyDefinition].freeze
        REDACT_FORMAT = 'md'.freeze

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
