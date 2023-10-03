# frozen_string_literal: true

module I18n
  module Resources
    module Dashboard
      module MarketingAnnouncements
        class SyncOut < I18n::Utils::SyncOutBase
        end
      end
    end
  end
end

I18n::Resources::Dashboard::MarketingAnnouncements::SyncOut.perform if __FILE__ == $0
