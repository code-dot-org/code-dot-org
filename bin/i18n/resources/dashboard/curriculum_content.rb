require_relative 'curriculum_content/sync_in'
require_relative '../../metrics'

module I18n
  module Resources
    module Dashboard
      module CurriculumContent
        I18N_SOURCE_FILE_PATH = CDO.dir(File.join(I18N_SOURCE_DIR, 'curriculum_content')).freeze
        REDACT_RESTORE_PLUGINS = %w[resourceLink vocabularyDefinition].freeze

        def self.sync_in
          SyncIn.perform
        end
      end
    end
  end
end
