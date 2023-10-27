require_relative '../../i18n_script_utils'
require_relative '../dashboard'

Dir[File.expand_path('../blocks/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Dashboard
      module Blocks
        FILE_NAME = 'blocks.yml'.freeze

        ORIGIN_I18N_FILE_PATH = File.join(I18n::Resources::Dashboard::ORIGIN_I18N_DIR_PATH, 'blocks.en.yml').freeze
        I18N_SOURCE_FILE_PATH = File.join(I18n::Resources::Dashboard::I18N_SOURCE_DIR_PATH, FILE_NAME).freeze
        I18N_BACKUP_FILE_PATH = File.join(I18n::Resources::Dashboard::I18N_BACKUP_DIR_PATH, FILE_NAME).freeze

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
