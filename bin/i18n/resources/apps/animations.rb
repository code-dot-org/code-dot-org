require_relative '../../i18n_script_utils'

Dir[File.expand_path('../animations/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Apps
      module Animations
        DIR_NAME = 'animations'.freeze
        I18N_SOURCE_DIR_PATH = CDO.dir(File.join(I18N_SOURCE_DIR, DIR_NAME)).freeze
        SPRITELAB_FILE_NAME = 'spritelab_animation_library.json'.freeze

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
