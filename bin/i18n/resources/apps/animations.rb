require_relative '../../i18n_script_utils'

module I18n
  module Resources
    module Apps
      module Animations
        DIR_NAME = 'animations'.freeze
        FILE_NAME = 'spritelab_animation_library.json'.freeze
        I18N_SOURCE_FILE_PATH = CDO.dir(I18N_SOURCE_DIR, DIR_NAME, FILE_NAME).freeze

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

Dir[File.expand_path('../animations/**/*.rb', __FILE__)].sort.each {|file| require file}
