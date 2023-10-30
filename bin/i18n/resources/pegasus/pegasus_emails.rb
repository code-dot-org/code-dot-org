require_relative '../../i18n_script_utils'

Dir[File.expand_path('../pegasus_emails/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Pegasus
      module PegasusEmails
        PARTIAL_EXTNAME = '.partial'.freeze
        ORIGIN_DIR_PATH = CDO.dir('pegasus/emails').freeze
        ORIGIN_I18N_DIR_PATH = File.join(ORIGIN_DIR_PATH, 'i18n').freeze
        I18N_SOURCE_DIR_PATH = CDO.dir(I18N_SOURCE_DIR, 'pegasus_emails/public').freeze

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
