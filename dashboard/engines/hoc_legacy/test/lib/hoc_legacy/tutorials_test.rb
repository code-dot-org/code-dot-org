# frozen_string_literal: true

require 'test_helper'

class HocLegacy::TutorialsTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  let(:tutorial_code) {'mc'}

  def tutorials_cache
    described_class.send(:cache).read(described_class::CACHE_KEY)
  end

  setup do
    VCR.configure do |config|
      config.cassette_library_dir = dashboard_engines_dir('hoc_legacy', 'test', 'fixtures', 'vcr_cassettes')
    end
  end

  around do |test|
    described_class.clear
    VCR.use_cassette('hoc_legacy/tutorials') {test.call}
  ensure
    described_class.clear
  end

  describe '.get' do
    subject(:get_tutorial) {described_class.get(tutorial_code)}

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
        ).once
        get_tutorial
      end
    end
  end

  describe '.refresh' do
    subject(:refresh_tutorials) {described_class.refresh}

    it 'stores new Tutorial entries and returns true' do
      _ {_refresh_tutorials.must_equal(true)}.must_change -> {tutorials_cache},
                                                          from: nil,
                                                          to: hash_including(tutorial_code => instance_of(Contentful::Entry))
    end

    context 'when fetching tutorials fails second time' do
      before do
        allow(CdoContentful::CsForAll::Entry::Tutorial).to receive(:find_each).
          with(limit: 200, order: 'fields.tutorialID', 'tutorialID[exists]': true).
          and_raise(expected_error)
      end

      let(:expected_store) {'expected_store'}
      let(:expected_error) {StandardError.new('Failed to fetch Tutorial entries')}

      it 'raises error and does not update store' do
        _(tutorials_cache).must_be_nil
        _(_ {refresh_tutorials}.must_raise).must_equal expected_error
        _(tutorials_cache).must_be_nil
      end
    end
  end

  describe '.clear' do
    subject(:clear_tutorials) {described_class.clear}

    let(:cache_data) {Faker::Internet.unique.uuid}

    before do
      described_class.send(:cache).write(described_class::CACHE_KEY, cache_data)
    end

    it 'deletes Tutorial entries and returns true' do
      _ {_clear_tutorials.must_equal(true)}.must_change -> {tutorials_cache}, from: cache_data, to: nil
    end
  end
end
