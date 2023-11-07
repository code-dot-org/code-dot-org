require_relative '../../i18n_script_utils'
require_relative '../dashboard'

Dir[File.expand_path('../devise_content/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Dashboard
      module DeviseContent
        FILE_NAME = 'devise.yml'.freeze

        ORIGIN_I18N_FILE_PATH = File.join(ORIGIN_I18N_DIR_PATH, 'devise.en.yml').freeze
        I18N_SOURCE_FILE_PATH = File.join(I18N_SOURCE_DIR_PATH, FILE_NAME).freeze

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
