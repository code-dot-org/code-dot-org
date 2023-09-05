require_relative '../../i18n_script_utils'

Dir[File.expand_path('../external_sources/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Apps
      module ExternalSources
        DIR_NAME = 'external-sources'.freeze
        BLOCKLY_CORE_DIR_NAME = 'blockly-core'.freeze
        I18N_SOURCE_DIR_PATH = CDO.dir(File.join(I18N_SOURCE_DIR, DIR_NAME)).freeze

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
