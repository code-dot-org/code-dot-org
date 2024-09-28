#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_in_base'
require_relative '../../../redact_restore_utils'
require_relative '../blocks'

module I18n
  module Resources
    module Dashboard
      module Blocks
        class SyncIn < I18n::Utils::SyncInBase
          def process
            prepare
          end

          private def blocks_data
            Dir.glob(CDO.dir('dashboard/config/blocks/**/*.json')).each_with_object({}) do |file_path, blocks|
              config = I18nScriptUtils.parse_file(file_path)['config']
              block_name = File.basename(file_path, '.*')
              blocks[block_name] = {}

              blocks[block_name]['text'] = config['blockText']
              next unless config['args']

              blocks[block_name]['options'] = config['args'].each_with_object({}) do |arg, args_options|
                next if arg['options'].nil? || arg['options'].empty?

                args_options[arg['name']] = arg['options'].each_with_object({}) do |option_tuple, arg_options|
                  arg_options[option_tuple.last] = option_tuple.first
                end
              end

              blocks[block_name].delete('options') if blocks[block_name]['options'].empty?
            end
          end

          private def prepare
            I18nScriptUtils.write_json_file(I18N_SOURCE_FILE_PATH, blocks_data)
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::Blocks::SyncIn.perform if __FILE__ == $0
