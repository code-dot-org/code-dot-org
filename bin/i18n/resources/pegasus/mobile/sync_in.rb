#!/usr/bin/env ruby

require 'fileutils'

require_relative '../../../i18n_script_utils'
require_relative '../mobile'

module I18n
  module Resources
    module Pegasus
      module Mobile
        class SyncIn
          def self.perform
            new.execute
          end

          def execute
            progress_bar.start

            # TODO: fix `i18n/locales/source/pegasus/mobile.yml` instead of the original file `pegasus/cache/i18n/en-US.yml`
            pegasus_i18n_file_path = File.join(ORIGIN_I18N_DIR_PATH, 'en-US.yml')
            I18nScriptUtils.fix_yml_file(pegasus_i18n_file_path)
            I18nScriptUtils.copy_file(pegasus_i18n_file_path, CDO.dir(I18N_SOURCE_DIR, DIR_NAME, FILE_NAME))

            progress_bar.finish
          end

          private

          def progress_bar
            @progress_bar ||= I18nScriptUtils.create_progress_bar(title: 'Pegasus/mobile sync-in')
          end
        end
      end
    end
  end
end

I18n::Resources::Pegasus::Mobile::SyncIn.perform if __FILE__ == $0
