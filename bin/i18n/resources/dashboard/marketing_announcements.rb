Dir[File.expand_path('../marketing_announcements/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Dashboard
      module MarketingAnnouncements
        DIR_NAME = 'marketing'.freeze
        FILE_NAME = 'announcements.json'.freeze

        def self.sync_in
          SyncIn.perform
        end

        def self.sync_out
          SyncOut.perform
        end
      end
    end
  end
end
