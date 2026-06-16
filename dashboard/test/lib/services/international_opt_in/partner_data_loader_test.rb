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

  describe '.partner_entries' do
    it 'returns all partner arrays with organizer_not_listed added' do
      entries = described_class.partner_entries
      extra_value = ::I18n.t('pd.international_opt_in.organizer_not_listed')
      brand_name = Cdo::Brand.legal_name

      _(entries).must_be_kind_of Hash
      entries.values.each do |values|
        _(values).must_include brand_name
        _(values).must_include extra_value
      end
    end
  end
end
