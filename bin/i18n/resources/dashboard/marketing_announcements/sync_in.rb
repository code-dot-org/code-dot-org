#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_in_base'
require_relative '../marketing_announcements'

module I18n
  module Resources
    module Dashboard
      module MarketingAnnouncements
        class SyncIn < I18n::Utils::SyncInBase
          def process
            prepare_marketing_announcements_data
          end

          private

          def prepare_marketing_announcements_data
            banners = I18nScriptUtils.parse_file(ORIGIN_I18N_FILE_PATH)['banners']

            banners.each_value do |banner|
              banner.slice!('title', 'body', 'buttonText')
            end

            I18nScriptUtils.write_json_file(I18N_SOURCE_FILE_PATH, {'banners' => banners})
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::MarketingAnnouncements::SyncIn.perform if __FILE__ == $0
