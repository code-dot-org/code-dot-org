require_relative '../../i18n_script_utils'
require_relative '../dashboard'

Dir[File.expand_path('../courses/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Dashboard
      module Courses
        FILE_NAME = 'courses.yml'.freeze

        ORIGIN_I18N_FILE_PATH = File.join(I18n::Resources::Dashboard::ORIGIN_I18N_DIR_PATH, 'courses.en.yml').freeze
        I18N_SOURCE_FILE_PATH = File.join(I18n::Resources::Dashboard::I18N_SOURCE_DIR_PATH, FILE_NAME).freeze
        I18N_BACKUP_FILE_PATH = File.join(I18n::Resources::Dashboard::I18N_BACKUP_DIR_PATH, FILE_NAME).freeze

        # Currently, csd is the only fully translatable course that has resources in this directory
        TRANSLATABLE_COURSES = %w[csd].freeze
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
