require_relative '../../i18n_script_utils'

module I18n
  module Resources
    module Apps
      module ExternalSources
        DIR_NAME = 'external-sources'.freeze
        BLOCKLY_CORE_DIR_NAME = 'blockly-core'.freeze

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
