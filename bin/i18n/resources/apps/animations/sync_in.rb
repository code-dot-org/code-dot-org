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
        class SyncIn
          def self.perform
            new.execute
          end

          def execute
            progress_bar.start

            FileUtils.mkdir_p(I18N_SOURCE_DIR_PATH)
            progress_bar.progress = 1

            animation_strings = sprintlab_manifest_builder.get_animation_strings
            progress_bar.progress = 95

            File.write(File.join(I18N_SOURCE_DIR_PATH, SPRITELAB_FILE_NAME), JSON.pretty_generate(animation_strings))

            progress_bar.finish
          end

          private

          def sprintlab_manifest_builder
            @sprintlab_manifest_builder ||= ManifestBuilder.new({spritelab: true, quiet: true})
          end

          def progress_bar
            @progress_bar ||= ProgressBar.create(
              title: 'Apps/animations sync-in',
              format: I18nScriptUtils::PROGRESS_BAR_FORMAT,
            )
          end
        end
      end
    end
  end
end

I18n::Resources::Apps::Animations::SyncIn.perform if __FILE__ == $0
