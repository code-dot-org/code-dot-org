require 'fileutils'
require 'json'

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
            marketing_announcements_file = File.join(I18N_SOURCE_DIR_PATH, DIR_NAME, 'announcements.json')
            marketing_announcement_strings = {'banners' => {}}

            banners = JSON.load_file(File.join(DASHBOARD_CONFIG_PATH, DIR_NAME, FILE_NAME))['banners']
            banners.each do |banner_id, content|
              marketing_announcement_strings['banners'][banner_id] = {
                'title' => content['title'],
                'body' => content['body'],
                'buttonText' => content['buttonText']
              }
            end
            FileUtils.mkdir_p(File.join(I18N_SOURCE_DIR_PATH, DIR_NAME))
            File.write(marketing_announcements_file, JSON.pretty_generate(marketing_announcement_strings))
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::MarketingAnnouncements::SyncIn.perform if __FILE__ == $0
