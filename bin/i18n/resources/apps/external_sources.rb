require_relative '../../i18n_script_utils'

module I18n
  module Resources
    module Apps
      module ExternalSources
        DIR_NAME = 'external-sources'.freeze
        I18N_SOURCE_DIR_PATH = CDO.dir(I18N_SOURCE_DIR, DIR_NAME).freeze

        BLOCKLY_CORE_FILE_NAME = 'core.json'
        BLOCKLY_CORE_DIR_NAME = 'blockly-core'.freeze
        BLOCKLY_CORE_I18N_SOURCE_DIR = CDO.dir(I18N_SOURCE_DIR, BLOCKLY_CORE_DIR_NAME).freeze

        ML_PLAYGROUND_FILE_NAME = 'mlPlayground.json'.freeze
        ML_PLAYGROUND_DIR_NAME = 'ml-playground'.freeze
        ML_PLAYGROUND_I18N_SOURCE_DIR = File.join(I18N_SOURCE_DIR_PATH, ML_PLAYGROUND_DIR_NAME).freeze

        DATASETS_DIR_NAME = 'datasets'.freeze
        DATASETS_I18N_SOURCE_DIR = File.join(ML_PLAYGROUND_I18N_SOURCE_DIR, DATASETS_DIR_NAME).freeze

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

Dir[File.expand_path('../external_sources/**/*.rb', __FILE__)].sort.each {|file| require file}
