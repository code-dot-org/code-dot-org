require_relative '../../i18n_script_utils'
require_relative '../dashboard'

module I18n
  module Resources
    module Dashboard
      module Slides
        FILE_NAME = 'slides.yml'.freeze

        ORIGIN_I18N_FILE_PATH = File.join(ORIGIN_I18N_DIR_PATH, 'slides.en.yml').freeze
        I18N_SOURCE_FILE_PATH = File.join(I18N_SOURCE_DIR_PATH, FILE_NAME).freeze

        def self.sync_in
          SyncIn.perform
        end

        def self.sync_up(**opts)
          SyncUp.perform(**opts)
        end

        def self.sync_out
          SyncOut.perform
        end
      end
    end
  end
end

Dir[File.expand_path('../slides/**/*.rb', __FILE__)].sort.each {|file| require file}
