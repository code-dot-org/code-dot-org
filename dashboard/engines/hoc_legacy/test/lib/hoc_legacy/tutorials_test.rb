# frozen_string_literal: true

require 'test_helper'

class HocLegacy::TutorialsTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  self.vcr_cassette_library_dir = HocLegacy::Engine.root.join('test/vcr_cassettes')

  let(:tutorial_code) {'mc'}

  def tutorials_cache
    described_class.send(:cache).read(described_class::CACHE_KEY)
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

    # The ui-test-* courses are served by a dev/test stand-in (so the HoC UI
    # tests need no Contentful access token), ahead of the Contentful lookup.
    context 'for a ui-test course' do
      let(:tutorial_code) {'ui-test-artist'}

      it 'serves the stand-in entry without querying Contentful' do
        expect(CdoContentful::CsForAll::Entry::Tutorial).not_to receive(:find_each)

        _(get_tutorial.tutorial_id).must_equal 'ui-test-artist'
        _(get_tutorial.primary_link_ref.fields[:primary_target]).
          must_equal CDO.studio_url('/s/ui-test-artist/reset')
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

    context 'in development without a Contentful access token' do
      before do
        allow(CDO).to receive(:rack_env?).and_call_original
        allow(CDO).to receive(:rack_env?).with(:development).and_return(true)
        allow(CDO).to receive(:contentful_cs_for_all_access_token).and_return(nil)
      end

      it 'raises an actionable error instead of the opaque Contentful failure' do
        error = _ {refresh_tutorials}.must_raise RuntimeError
        _(error.message).must_match(/contentful_cs_for_all_access_token/)
        _(error.message).must_match(%r{ui-test-})
      end
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
