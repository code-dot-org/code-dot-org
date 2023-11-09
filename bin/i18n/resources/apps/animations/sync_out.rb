#!/usr/bin/env ruby

require_relative '../../../../animation_assets/manifest_builder'
require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_out_base'
require_relative '../animations'

module I18n
  module Resources
    module Apps
      module Animations
        class SyncOut < I18n::Utils::SyncOutBase
          def process(language)
            crowdin_file_path = I18nScriptUtils.locale_dir(language[:crowdin_name_s], DIR_NAME, FILE_NAME)
            return unless File.exist?(crowdin_file_path)

            unless I18nScriptUtils.source_lang?(language)
              js_locale = I18nScriptUtils.to_js_locale(language[:locale_s])
              i18n_data = I18nScriptUtils.parse_file(crowdin_file_path)
              spritelab_manifest_builder.upload_localized_manifest(js_locale, i18n_data)
            end

            i18n_file_path = I18nScriptUtils.locale_dir(language[:locale_s], DIR_NAME, FILE_NAME)
            I18nScriptUtils.move_file(crowdin_file_path, i18n_file_path)
          end

          private

          def spritelab_manifest_builder
            @spritelab_manifest_builder ||= begin
              spritelab_manifest_builder = ManifestBuilder.new({spritelab: true, upload_to_s3: true, quiet: true})

              # Memoizes animation metadata before processing in threads
              # to prevent them from being downloaded multiple times (in each thread separately)
              mutex.synchronize {spritelab_manifest_builder.initial_animation_metadata}

              spritelab_manifest_builder
            end
          end
        end
      end
    end
  end
end

I18n::Resources::Apps::Animations::SyncOut.perform if __FILE__ == $0
