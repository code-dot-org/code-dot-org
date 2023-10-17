#!/usr/bin/env ruby

require_relative '../../../../../dashboard/config/environment'
require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_in_base'
require_relative '../../../redact_restore_utils'
require_relative '../../dashboard'
require_relative '../marketing_announcements'

module I18n
  module Resources
    module Dashboard
      module MarketingAnnouncements
        class SyncIn < I18n::Utils::SyncInBase
          def process
            progress_bar.progress = 50
            prepare_marketing_announcements_data
          end

          private

          def prepare_marketing_announcements_data
            marketing_announcement_strings = {'banners' => {}}

            banners = I18nScriptUtils.parse_file(ORIGIN_I18N_FILE_PATH)['banners']
            banners.each do |banner_id, content|
              marketing_announcement_strings['banners'][banner_id] = {
                'title' => content['title'],
                'body' => content['body'],
                'buttonText' => content['buttonText']
              }
            end
            I18nScriptUtils.write_json_file(I18N_SOURCE_FILE_PATH, marketing_announcement_strings)
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::MarketingAnnouncements::SyncIn.perform if __FILE__ == $0
