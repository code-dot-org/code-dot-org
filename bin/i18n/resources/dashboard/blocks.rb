require_relative '../../i18n_script_utils'

Dir[File.expand_path('../blocks/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Dashboard
      module Blocks
        DIR_NAME = 'dashboard'.freeze
        FILE_NAME = 'blocks.yml'.freeze

        ORIGIN_I18N_FILE_PATH = CDO.dir('dashboard/config/locales/blocks.en.yml').freeze
        I18N_SOURCE_FILE_PATH = CDO.dir(I18N_SOURCE_DIR, DIR_NAME, FILE_NAME).freeze
        I18N_BACKUP_FILE_PATH = CDO.dir(I18N_ORIGINAL_DIR, DIR_NAME, FILE_NAME).freeze

        REDACT_PLUGINS = %w[blockfield].freeze
        REDACT_FORMAT = 'txt'.freeze

        # Pull in various fields for custom blocks from .json files and save them to blocks.en.yml
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
