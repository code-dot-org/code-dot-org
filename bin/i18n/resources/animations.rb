require 'fileutils'
require 'json'

require_relative '../i18n_script_utils'
require_relative '../../animation_assets/manifest_builder'

module I18n
  module Resources
    module Animations
      SYNC_IN_RESULT_FILE_PATH = CDO.dir(
        File.join(I18N_SOURCE_ANIMATIONS_DIR, 'spritelab_animation_library.json')
      ).freeze

      def self.sync_in
        FileUtils.mkdir_p(CDO.dir(I18N_SOURCE_ANIMATIONS_DIR))

        animation_strings = ManifestBuilder.new({spritelab: true, quiet: true}).get_animation_strings

        File.write(SYNC_IN_RESULT_FILE_PATH, JSON.pretty_generate(animation_strings))
      end
    end
  end
end
