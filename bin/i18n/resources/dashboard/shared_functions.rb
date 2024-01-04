require_relative '../../../../dashboard/config/environment'
require_relative '../../i18n_script_utils'
require_relative '../dashboard'

module I18n
  module Resources
    module Dashboard
      module SharedFunctions
        FILE_NAME = 'shared_functions.yml'.freeze
        I18N_SOURCE_FILE_PATH = File.join(I18N_SOURCE_DIR_PATH, FILE_NAME).freeze

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

Dir[File.expand_path('../shared_functions/**/*.rb', __FILE__)].sort.each {|file| require file}
