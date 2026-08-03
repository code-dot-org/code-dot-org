require 'json'
require 'cdo/honeybadger'

module Services
  module InternationalOptIn
    class PartnerDataLoader
      DATA_PATH = Rails.root.join('config', 'international_opt_in', 'international_partners_data.json')
      SUPPORTED_COUNTRIES_DATA_PATH = Rails.root.join(
        'config',
        'international_opt_in',
        'supported_countries.json'
      )

      def self.partners
        @partners ||= load_data(DATA_PATH, 'international partners')
      end

      def self.supported_countries
        @supported_countries ||=
          load_data(SUPPORTED_COUNTRIES_DATA_PATH, 'supported countries')
      end

      def self.partner_entries
        supported_countries.keys.index_with do |country_key|
          partners.fetch(country_key, []) +
            [
              Cdo::Brand.legal_name,
              ::I18n.t('pd.international_opt_in.organizer_not_listed')
            ]
        end
      end

      def self.load_data(path, description)
        JSON.parse(File.read(path)).freeze
      rescue Errno::ENOENT, JSON::ParserError => exception
        Honeybadger.notify(
          exception,
          error_message: "Error loading #{description} JSON: #{exception.message}"
        )
        {}
      end

      private_class_method :load_data
    end
  end
end
