#!/usr/bin/env ruby

require 'fileutils'
require 'json'

require_relative '../../../../animation_assets/manifest_builder'
require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_in_base'
require_relative '../animations'

module I18n
  module Resources
    module Apps
      module Animations
        class SyncIn < I18n::Utils::SyncInBase
          def process
            I18nScriptUtils.write_json_file(I18N_SOURCE_FILE_PATH, spritelab_manifest_builder.get_animation_strings)
          end

          private

          def spritelab_manifest_builder
            @spritelab_manifest_builder ||= ManifestBuilder.new({spritelab: true, quiet: true})
          end
        end
      end
    end
  end
end

I18n::Resources::Apps::Animations::SyncIn.perform if __FILE__ == $0
