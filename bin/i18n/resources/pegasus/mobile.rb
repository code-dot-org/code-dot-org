require_relative '../../i18n_script_utils'
require_relative '../pegasus'

module I18n
  module Resources
    module Pegasus
      module Mobile
        FILE_NAME = 'mobile.json'
        FILE_PATH = File.join(DIR_NAME, FILE_NAME).freeze
        ORIGIN_I18N_DIR_PATH = CDO.dir('pegasus/cache/i18n').freeze

        ORIGINAL_I18N_FILE_PATH = File.join(ORIGIN_I18N_DIR_PATH, 'en-US.json').freeze
        I18N_SOURCE_FILE_PATH = CDO.dir(I18N_SOURCE_DIR, FILE_PATH).freeze

        def self.sync_in
          SyncIn.perform
        end

        def self.sync_up(**opts)
          SyncUp.perform(**opts)
        end

        def self.sync_down(**opts)
          SyncDown.perform(**opts)
        end

        def self.sync_out
          SyncOut.perform
        end
      end
    end
  end
end

Dir[File.expand_path('../mobile/**/*.rb', __FILE__)].sort.each {|file| require file}
