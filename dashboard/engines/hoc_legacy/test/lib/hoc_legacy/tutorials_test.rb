# frozen_string_literal: true

require 'test_helper'

class HocLegacy::TutorialsTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  setup do
    VCR.configure do |config|
      config.cassette_library_dir = dashboard_engines_dir('hoc_legacy', 'test', 'fixtures', 'vcr_cassettes')
    end
  end

  around do |test|
    described_class.send(:cache).delete(described_class::CACHE_KEY)
    test.call
  ensure
    described_class.send(:cache).delete(described_class::CACHE_KEY)
  end

  describe '.get' do
    subject(:get_tutorial) {described_class.get(tutorial_code)}

    let(:tutorial_code) {'mc'}

    around do |test|
      VCR.use_cassette('hoc_legacy/tutorials') do
        test.call
      end
    end

    it 'returns expected Tutorial entry' do
      _get_tutorial.must_be_instance_of Contentful::Entry
      _(get_tutorial.content_type.id).must_equal 'curriculum'
      _(get_tutorial.tutorial_id).must_equal tutorial_code
      _(get_tutorial.primary_link_ref.primary_target).must_equal '/minecraft'
      _(get_tutorial.secondary_link_ref.primary_target).must_equal 'https://studio.code.org/courses/mc/units/1/lessons/1'
    end

    context 'when tutorial does not exist' do
      let(:tutorial_code) {'non_existent_tutorial_code'}

      it 'returns nil' do
        _get_tutorial.must_be_nil
      end
    end

    context 'when Tutorial entry is invalid' do
      let(:error) {StandardError.new('Invalid Tutorial entry')}

      before do
        allow_any_instance_of(Contentful::Entry).to receive(:tutorial_id).and_raise(error)
      end

      it 'returns nil' do
        _get_tutorial.must_be_nil
      end

      it 'notifies Honeybadger' do
        expect(Honeybadger).to receive(:notify).with(
          error,
          error_message: '[Contentful] Invalid Tutorial entry',
          context: kind_of(Hash)
        )
        get_tutorial
      end
    end
  end

  describe '.refresh' do
    subject(:refresh_tutorials) {described_class.refresh}

    before do
      allow(CdoContentful::CsForAll::Entry::Tutorial).to receive(:find_each).and_return([].to_enum)
    end

    it 'stores new Tutorial entries and returns true' do
      original_tutorial_id = 'original_tutorial_id'
      refreshed_tutorial_id = 'refreshed_tutorial_id'

      expect(CdoContentful::CsForAll::Entry::Tutorial).
        to receive(:find_each).
        with(limit: 200, order: 'fields.tutorialID', 'tutorialID[exists]': true).
        exactly(2).times.
        and_return(
          [OpenStruct.new(tutorial_id: original_tutorial_id)].to_enum,
          [OpenStruct.new(tutorial_id: refreshed_tutorial_id)].to_enum,
        )

      _ {_refresh_tutorials.must_equal(true)}.must_change -> {described_class.send(:store).keys},
                                                          from: [original_tutorial_id],
                                                          to: [refreshed_tutorial_id]
    end

    context 'when fetching tutorials fails second time' do
      before do
        expect(described_class).to receive(:fetch_all).and_return(expected_store).ordered
        expect(described_class).to receive(:fetch_all).and_raise(expected_error).ordered
      end

      let(:expected_store) {'expected_store'}
      let(:expected_error) {StandardError.new('Failed to fetch Tutorial entries')}

      it 'raises error and does not update store' do
        _(described_class.send(:store)).must_equal expected_store
        _(_ {refresh_tutorials}.must_raise).must_equal expected_error
        _(described_class.send(:store)).must_equal expected_store
      end
    end
  end
end
