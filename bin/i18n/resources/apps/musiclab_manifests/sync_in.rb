#!/usr/bin/env ruby

require 'fileutils'
require 'json'

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_in_base'
require 'cdo/aws/s3'

module I18n
  module Resources
    module Apps
      module Animations
        class SyncIn < I18n::Utils::SyncInBase
          I18N_SOURCE_FILE_PATH = CDO.dir(I18N_SOURCE_DIR, 'musiclab_manifests', 'music-library-intro2024.json').freeze

          def process
            I18nScriptUtils.write_json_file(I18N_SOURCE_FILE_PATH, get_translation_strings)
          end

          private def get_translation_strings
            manifest = JSON.parse(AWS::S3.download_from_bucket('cdo-curriculum', 'media/musiclab/music-library-intro2024.json'))

            strings = {}

            manifest['instruments'].each do |instrument|
              instrument_name = instrument['name']
              strings[instrument_name] = instrument_name
            end

            manifest['kits'].each do |kit|
              kit_name = kit['name']
              strings[kit_name] = kit_name
              kit['sounds'].each do |sound|
                sound_name = sound['name']
                strings[sound_name] = sound_name
              end
            end

            manifest['packs'].each do |pack|
              pack_name = pack['name']
              strings[pack_name] = pack_name
              pack['sounds'].each do |sound|
                sound_name = sound['name']
                strings[sound_name] = sound_name
              end
            end

            strings
          end
        end
      end
    end
  end
end

I18n::Resources::Apps::Animations::SyncIn.perform if __FILE__ == $0
