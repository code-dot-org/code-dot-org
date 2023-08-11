require 'fileutils'
require 'json'

require_relative '../../i18n_script_utils'
require_relative '../../../animation_assets/manifest_builder'
require_relative '../../metrics'

module I18n
  module Resources
    module Apps
      module Animations
        I18N_SOURCE_FILE_PATH = CDO.dir(File.join(I18N_SOURCE_DIR, 'animations/spritelab_animation_library.json')).freeze

        def self.sync_in
          FileUtils.mkdir_p(File.dirname(I18N_SOURCE_FILE_PATH))

          animation_strings = ManifestBuilder.new({spritelab: true, quiet: true}).get_animation_strings

          File.write(I18N_SOURCE_FILE_PATH, JSON.pretty_generate(animation_strings))
        end
      end
    end
  end
end
