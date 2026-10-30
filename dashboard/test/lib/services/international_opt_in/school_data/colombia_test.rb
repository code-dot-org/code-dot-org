require 'test_helper'

class Services::InternationalOptIn::SchoolData::ColombiaTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  let(:described_class) {Services::InternationalOptIn::SchoolData::Colombia}

  describe '.data' do
    it 'returns an array of hashes' do
      data = described_class.data

      _(data).must_be_kind_of Hash
      _(data).wont_be_empty
    end

    it 'returns frozen data' do
      _(described_class.data).must_be :frozen?
    end

    it 'memoizes the data' do
      first = described_class.data
      second = described_class.data

      _(first.object_id).must_equal second.object_id
    end

    it 'returns empty hash and reports to Honeybadger when file is missing' do
      bad_filename = 'does_not_exist.json'
      full_path = Services::InternationalOptIn::SchoolData::Base::SCHOOL_DATA_DIR.join(bad_filename)

      allow(File).to receive(:read).with(full_path).and_raise(Errno::ENOENT.new('File not found'))
      allow(Honeybadger).to receive(:notify)

      result = described_class.send(:load_json, bad_filename)

      _(result).must_equal({})
      expect(Honeybadger).to have_received(:notify)
    end
  end
end
