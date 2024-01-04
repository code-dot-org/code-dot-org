require_relative '../../i18n_script_utils'
require_relative '../dashboard'

module I18n
  module Resources
    module Dashboard
      module CourseContent
        DIR_NAME = 'course_content'.freeze
        I18N_SOURCE_DIR_PATH = CDO.dir(I18N_SOURCE_DIR, DIR_NAME).freeze
        I18N_BACKUP_DIR_PATH = CDO.dir(I18N_ORIGINAL_DIR, DIR_NAME).freeze

        BLOCK_CATEGORIES_TYPE = 'block_categories'.freeze
        PROGRESSIONS_TYPE = 'progressions'.freeze
        PARAMETER_NAMES_TYPE = 'parameter_names'.freeze
        VARIABLE_NAMES_TYPE = 'variable_names'.freeze

        REDACT_PLUGINS = %w[blockly].freeze

        def self.sync_in
          SyncIn.perform
        end

        def self.sync_up
          SyncUp.perform
        end

        def self.sync_out
          SyncOut.perform
        end
      end
    end
  end
end

Dir[File.expand_path('../course_content/**/*.rb', __FILE__)].sort.each {|file| require file}
