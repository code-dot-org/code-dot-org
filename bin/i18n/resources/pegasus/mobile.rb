require_relative '../../i18n_script_utils'

module I18n
  module Resources
    module Pegasus
      module Mobile
        DIR_NAME = 'pegasus'
        FILE_NAME = 'mobile.yml'
        ORIGIN_I18N_DIR_PATH = CDO.dir('pegasus/cache/i18n').freeze

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

Dir[File.expand_path('../mobile/**/*.rb', __FILE__)].sort.each {|file| require file}
