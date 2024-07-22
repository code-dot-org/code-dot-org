#!/usr/bin/env ruby

require 'fileutils'
require 'json'

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_in_base'
require 'cdo/aws/s3'

module I18n
  module Resources
    module Apps
      module MusiclabLibraries
        class SyncIn < I18n::Utils::SyncInBase
          LIBRARY_FILENAMES = %w[music-library-intro2024.json music-library-launch2024.json].freeze

          def process
            LIBRARY_FILENAMES.each do |filename|
              I18nScriptUtils.write_json_file(
                CDO.dir(I18N_SOURCE_DIR, 'musiclab_libraries', filename),
                get_translation_strings(filename)
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

            strings = {}

            manifest['instruments'].each do |instrument|
              name = instrument['name']
              id = instrument['id']
              strings[id] = name
            end

            manifest['kits'].each do |kit|
              kit_name = kit['name']
              kit_id = kit['id']
              strings[kit_id] = kit_name

              kit['sounds'].each do |sound|
                sound_name = sound['name']
                id = "#{kit_id}/#{sound['src']}"
                strings[id] = sound_name
              end
            end

            manifest['packs'].each do |pack|
              pack_id = pack['id']
              pack['sounds'].each do |sound|
                sound_name = sound['name']
                id = "#{pack_id}/#{sound['src']}"
                strings[id] = sound_name
              end
            end

            strings
          end
        end
      end
    end
  end
end

I18n::Resources::Apps::MusiclabLibraries::SyncIn.perform if __FILE__ == $0
