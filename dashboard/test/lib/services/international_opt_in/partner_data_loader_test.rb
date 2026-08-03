require 'test_helper'
require 'cdo/brand'

class Services::InternationalOptIn::PartnerDataLoaderTest < ActiveSupport::TestCase
  let(:described_class) {Services::InternationalOptIn::PartnerDataLoader}

  describe '.partners' do
    it 'returns a hash of arrays' do
      partners = described_class.partners

      _(partners).must_be_kind_of Hash
      _(partners.values).must_be :all?, ->(v) {v.is_a?(Array)}
    end
  end

  describe '.supported_countries' do
    it 'returns every unique country in the supported country data' do
      countries = described_class.supported_countries

      _(countries.size).must_equal 248
      _(countries.values.uniq.size).must_equal 248
      _(countries).must_include 'afghanistan'
      _(countries['afghanistan']).must_equal 'Afghanistan'
      _(countries['cote_d_ivoire']).must_equal "Côte d'Ivoire"
      _(countries['turkiye']).must_equal 'Türkiye'
    end
  end

  describe '.partner_entries' do
    it 'returns an organizer list for every supported country' do
      entries = described_class.partner_entries
      extra_value = ::I18n.t('pd.international_opt_in.organizer_not_listed')

      _(entries).must_be_kind_of Hash
      _(entries.keys).must_equal described_class.supported_countries.keys
      entries.values.each do |values|
        _(values).must_include Cdo::Brand.legal_name
        _(values).must_include extra_value
      end

      _(entries['afghanistan']).must_equal [Cdo::Brand.legal_name, extra_value]
    end

    it 'has supported country data for every country with partners' do
      unsupported_partner_countries =
        described_class.partners.keys - described_class.supported_countries.keys

      _(unsupported_partner_countries).must_be_empty
    end
  end
end
