require_relative '../../i18n_script_utils'
require_relative '../dashboard'

module I18n
  module Resources
    module Dashboard
      module CurriculumContent
        DIR_NAME = 'curriculum_content'.freeze

        I18N_SOURCE_DIR_PATH = CDO.dir(I18N_SOURCE_DIR, DIR_NAME).freeze
        I18N_BACKUP_DIR_PATH = CDO.dir(I18N_ORIGINAL_DIR, DIR_NAME).freeze

        REDACT_RESTORE_PLUGINS = %w[resourceLink vocabularyDefinition].freeze
        UNIT_SERIALIZER = Services::I18n::CurriculumSyncUtils::Serializers::ScriptCrowdinSerializer

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

Dir[File.expand_path('../curriculum_content/**/*.rb', __FILE__)].sort.each {|file| require file}
