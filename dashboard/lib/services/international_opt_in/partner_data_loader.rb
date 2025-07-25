require 'json'
require 'cdo/honeybadger'

module Services
  module InternationalOptIn
    class PartnerDataLoader
      DATA_PATH = Rails.root.join('config', 'international_opt_in', 'international_partners_data.json')

      def self.partners
        @partners ||= load_data
      end

      def self.partner_entries
        partners.transform_values do |list|
          list + [::I18n.t('pd.international_opt_in.organizer_not_listed')]
        end
      end

      def self.load_data
        JSON.parse(File.read(DATA_PATH)).freeze
      rescue Errno::ENOENT, JSON::ParserError => exception
        Honeybadger.notify(
          exception,
          error_message: "Error loading international partners JSON: #{exception.message}"
        )
        {}
      end

      private_class_method :load_data
    end
  end
end
