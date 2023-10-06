require_relative '../../i18n_script_utils'

Dir[File.expand_path('../docs/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Dashboard
      module Docs
        DIR_NAME = 'docs'.freeze
        I18N_SOURCE_DIR_PATH = CDO.dir(I18N_SOURCE_DIR, DIR_NAME).freeze
        I18N_BACKUP_DIR_PATH = CDO.dir(I18N_ORIGINAL_DIR, DIR_NAME).freeze

        REDACT_PLUGINS = %w[visualCodeBlock link resourceLink].freeze

        def self.sync_in
          SyncIn.perform
        end
      end
    end
  end
end
