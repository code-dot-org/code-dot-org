#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_out_base'
# require_relative '../animations'

module I18n
  module Resources
    module Apps
      module MusiclabLibraries
        class SyncOut < I18n::Utils::SyncOutBase
          def process(language)
            crowdin_file_path = I18nScriptUtils.crowdin_locale_dir(language[:locale_s], 'musiclab_libraries', 'music-library-intro2024.json')
            return unless File.exist?(crowdin_file_path)

            js_locale = I18nScriptUtils.to_js_locale(language[:locale_s])
            i18n_data = I18nScriptUtils.parse_file(crowdin_file_path)
            upload_localized_strings(js_locale, i18n_data) unless options[:testing]

            i18n_file_path = I18nScriptUtils.locale_dir(language[:locale_s], 'musiclab_libraries', 'music-library-intro2024.json')
            I18nScriptUtils.move_file(crowdin_file_path, i18n_file_path)
            I18nScriptUtils.remove_empty_dir File.dirname(crowdin_file_path)
          end

          private def upload_localized_strings(js_locale, i18n_data)
            AWS::S3.upload_to_bucket(
              'cdo-curriculum',
              "media/musiclab/music-library-intro2024-loc/#{js_locale}.json",
              JSON.pretty_generate(i18n_data),
              acl: 'public-read',
              no_random: true,
              content_type: 'json',
            )
          end
        end
      end
    end
  end
end

I18n::Resources::Apps::MusiclabLibraries::SyncOut.perform if __FILE__ == $0
