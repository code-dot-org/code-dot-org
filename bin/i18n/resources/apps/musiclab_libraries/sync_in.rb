#!/usr/bin/env ruby

require 'fileutils'
require 'json'

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_in_base'
require_relative '../musiclab_libraries'

module I18n
  module Resources
    module Apps
      module MusiclabLibraries
        class SyncIn < I18n::Utils::SyncInBase
          def process
            LIBRARY_NAME_IN_OUT_MAPPINGS.each do |name_map|
              I18nScriptUtils.write_json_file(
                CDO.dir(I18N_SOURCE_DIR, DIR_NAME, "#{name_map[:to]}.json"),
                get_translation_strings("#{name_map[:from]}.json")
              )
            end
          end

          private def get_translation_strings(library_filename)
            manifest = JSON.parse(
              AWS::S3.download_from_bucket(
                'cdo-curriculum',
                "media/musiclab/#{library_filename}"
              )
            )

            strings_to_translate = {}

            manifest['instruments'].each do |instrument|
              id = instrument['id']
              strings_to_translate[id] = instrument['name']
            end

            manifest['kits'].each do |kit|
              kit_id = kit['id']
              strings_to_translate[kit_id] = kit['name']

              kit['sounds'].each do |sound|
                id = "#{kit_id}/#{sound['src']}"
                strings_to_translate[id] = sound['name']
              end
            end

            manifest['packs'].each do |pack|
              pack_id = pack['id']
              strings_to_translate[pack_id] = pack['name'] unless pack['skipLocalization']

              pack['sounds'].each do |sound|
                id = "#{pack_id}/#{sound['src']}"
                strings_to_translate[id] = sound['name'] unless sound['skipLocalization']
              end
            end

            strings_to_translate
          end
        end
      end
    end
  end
end

I18n::Resources::Apps::MusiclabLibraries::SyncIn.perform if __FILE__ == $0
