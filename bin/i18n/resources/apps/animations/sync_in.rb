#!/usr/bin/env ruby

require 'fileutils'
require 'json'

require_relative '../../../../animation_assets/manifest_builder'
require_relative '../../../i18n_script_utils'
require_relative '../animations'

module I18n
  module Resources
    module Apps
      module Animations
        module SyncIn
          SPRITELAB_FILE_NAME = 'spritelab_animation_library.json'.freeze

          def self.perform
            FileUtils.mkdir_p(I18N_SOURCE_DIR_PATH)

            animation_strings = ManifestBuilder.new({spritelab: true, quiet: true}).get_animation_strings

            File.write(File.join(I18N_SOURCE_DIR_PATH, SPRITELAB_FILE_NAME), JSON.pretty_generate(animation_strings))
          end
        end
      end
    end
  end
end

I18n::Resources::Apps::Animations::SyncIn.perform if __FILE__ == $0
