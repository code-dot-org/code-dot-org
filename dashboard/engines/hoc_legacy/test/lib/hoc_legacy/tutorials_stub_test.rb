# frozen_string_literal: true

require 'test_helper'

# Covers the Contentful-free tutorial stub served by HocLegacy::Tutorials. The
# real Contentful path is covered by HocLegacy::TutorialsTest.
class HocLegacy::TutorialsStubTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  # stub_tutorial_targets defaults to true in the test environment
  # (config/test.yml.erb), so the stub is active here without extra setup.
  describe '.get (stubbed)' do
    it 'serves a stub entry for the ui-test-artist course' do
      tutorial = HocLegacy::Tutorials.get('ui-test-artist')
      _(tutorial.tutorial_id).must_equal 'ui-test-artist'
      _(tutorial.primary_link_ref.fields[:primary_target]).must_equal '/s/ui-test-artist/reset'
    end

    it 'serves stub entries for the allow-listed prod tutorial codes' do
      %w[flappy oceans mc kodable].each do |code|
        _(HocLegacy::Tutorials.get(code).tutorial_id).must_equal code
      end
    end

    it 'returns nil for a code that is not allow-listed' do
      _(HocLegacy::Tutorials.get('not-a-real-tutorial')).must_be_nil
    end

    it 'no-ops refresh without querying Contentful' do
      expect(CdoContentful::CsForAll::Entry::Tutorial).not_to receive(:find_each)
      _(HocLegacy::Tutorials.refresh).must_equal false
    end
  end

  describe 'when neither the stub flag nor an access token is set' do
    before do
      allow(CDO).to receive(:stub_tutorial_targets).and_return(false)
      allow(CDO).to receive(:contentful_cs_for_all_access_token).and_return(nil)
    end

    it 'raises an actionable error naming both options' do
      error = _ {HocLegacy::Tutorials.refresh}.must_raise RuntimeError
      _(error.message).must_match(/stub_tutorial_targets/)
      _(error.message).must_match(/contentful_cs_for_all_access_token/)
    end
  end
end
