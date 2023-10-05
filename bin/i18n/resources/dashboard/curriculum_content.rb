require_relative '../../i18n_script_utils'

Dir[File.expand_path('../curriculum_content/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Dashboard
      module CurriculumContent
        DIR_NAME = 'curriculum_content'.freeze
        I18N_SOURCE_DIR_PATH = CDO.dir(I18N_SOURCE_DIR, DIR_NAME).freeze
        REDACT_RESTORE_PLUGINS = %w[resourceLink vocabularyDefinition].freeze

        def self.sync_in
          SyncIn.perform
        end
      end
    end
  end
end
