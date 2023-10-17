require 'fileutils'

require_relative '../../i18n_script_utils'

Dir[File.expand_path('../hourofcode/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Pegasus
      module HourOfCode
        DIR_NAME = 'hourofcode'.freeze
        ORIGIN_I18N_FILE_NAME = 'en.yml'.freeze
        MARKDOWN_DIR_NAME = 'public'.freeze
        PARTIAL_EXTNAME = '.partial'.freeze

        ORIGIN_DIR_PATH = CDO.dir('pegasus/sites.v3/hourofcode.com').freeze
        ORIGIN_I18N_DIR_PATH = File.join(ORIGIN_DIR_PATH, 'i18n').freeze
        I18N_SOURCE_DIR_PATH = CDO.dir(I18N_SOURCE_DIR, DIR_NAME).freeze

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
