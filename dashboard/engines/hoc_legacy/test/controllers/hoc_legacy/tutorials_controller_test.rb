# frozen_string_literal: true

require 'test_helper'

class HocLegacy::TutorialsControllerTest < ActionDispatch::IntegrationTest
  include Minitest::RSpecMocks

  describe 'GET /api/hour/begin/:code' do
    subject(:begin_tutorial_request) {get "/api/hour/begin/#{tutorial_code}"}

    let(:tutorial_code) {'tutorial_code'}
    let(:tutorial_url) {'https://studio.code.org/expected/tutorial_url'}
    let(:tutorial_primary_ref) {OpenStruct.new(fields: {primary_target: tutorial_url})}
    let(:tutorial) {OpenStruct.new(tutorial_id: tutorial_code, primary_link_ref: tutorial_primary_ref)}

    let(:pegasus_db_mock) {double(:pegasus_db)}
    let(:forms_table_mock) {double(:forms_table)}

    before do
      allow(HocLegacy::Tutorials).to receive(:get)
      allow(HocLegacy::Tutorials).to receive(:get).with(tutorial_code).and_return(tutorial)
      allow(HocLegacy::TutorialLauncher).to receive(:call)
    end

    it 'launches tutorial' do
      begin_tutorial_request
      expect(HocLegacy::TutorialLauncher).to have_received(:call).with(controller:, tutorial:).once
    end

    it 'disables caching' do
      begin_tutorial_request
      must_disable_caching
    end

    it 'redirects to tutorial URL' do
      begin_tutorial_request
      must_respond_with :found
      must_redirect_to tutorial_url
    end

    context 'when tutorial primary link has relative url' do
      let(:tutorial_url) {'/relative/tutorial_url'}

      it 'redirects to tutorial URL on code.org domain' do
        begin_tutorial_request
        must_respond_with :found
        must_redirect_to 'https://test.code.org/relative/tutorial_url'
      end
    end

    context 'when no tutorial is found' do
      let(:tutorial) {nil}

      it 'returns error 404' do
        begin_tutorial_request

        must_respond_with :not_found
        must_select 'h1', '404: Page Not Found'

        expect(HocLegacy::TutorialLauncher).not_to have_received(:call)
      end
    end

    context 'when tutorial has no primary link' do
      let(:tutorial_primary_ref) {nil}

      it 'returns error 404' do
        begin_tutorial_request

        must_respond_with :not_found
        must_select 'h1', '404: Page Not Found'

        expect(HocLegacy::TutorialLauncher).not_to have_received(:call)
      end
    end

    context 'when tutorial primary link has no url' do
      let(:tutorial_url) {''}

      it 'returns error 404' do
        begin_tutorial_request

        must_respond_with :not_found
        must_select 'h1', '404: Page Not Found'

        expect(HocLegacy::TutorialLauncher).not_to have_received(:call)
      end
    end

    context 'when tracking is disabled' do
      before do
        allow(CDO).to receive(:hoc_tracking_enabled).and_return(false)
      end

      it 'returns error 404' do
        begin_tutorial_request

        must_respond_with :not_found
        must_select 'h1', '404: Page Not Found'

        expect(HocLegacy::TutorialLauncher).not_to have_received(:call)
      end
    end
  end

  describe 'GET /api/hour/begin_:code.png' do
    subject(:begin_tutorial_pixel_request) {get "/api/hour/begin_#{tutorial_code}.png"}

    let(:tutorial_code) {'tutorial_code'}
    let(:tutorial) {OpenStruct.new(tutorial_id: tutorial_code)}

    before do
      allow(HocLegacy::Tutorials).to receive(:get).with(tutorial_code).and_return(tutorial)
      allow(HocLegacy::TutorialPixelLauncher).to receive(:call)
    end

    it 'launches tutorial pixel' do
      begin_tutorial_pixel_request
      expect(HocLegacy::TutorialPixelLauncher).to have_received(:call).with(controller:, tutorial:).once
    end

    it 'sends pixel png file' do
      begin_tutorial_pixel_request

      must_respond_with :success

      _(response.content_type).must_equal 'image/png'
      _(response.headers['Content-Disposition']).must_equal %q[inline; filename="1x1.png"; filename*=UTF-8''1x1.png]
      _(response.body.bytesize).must_equal 110 # Size of 1x1.png
    end

    it 'disables caching' do
      begin_tutorial_pixel_request
      must_disable_caching
    end

    context 'when no tutorial is found' do
      let(:tutorial) {nil}

      it 'returns error 404' do
        begin_tutorial_pixel_request
        must_respond_with :not_found
        expect(HocLegacy::TutorialPixelLauncher).not_to have_received(:call)
      end
    end

    context 'when tracking is disabled' do
      before do
        allow(CDO).to receive(:hoc_tracking_enabled).and_return(false)
      end

      it 'doe not launch tutorial pixel' do
        begin_tutorial_pixel_request
        expect(HocLegacy::TutorialPixelLauncher).not_to have_received(:call).with(controller:, tutorial:)
      end

      it 'sends pixel png file' do
        begin_tutorial_pixel_request

        must_respond_with :success

        _(response.content_type).must_equal 'image/png'
        _(response.headers['Content-Disposition']).must_equal %q[inline; filename="1x1.png"; filename*=UTF-8''1x1.png]
        _(response.body.bytesize).must_equal 110 # Size of 1x1.png
      end
    end
  end

  describe 'GET /api/hour/finish' do
    subject(:finish_current_tutorial_request) {get '/api/hour/finish'}

    let(:session_id) {Faker::Internet.unique.uuid}
    let(:session_row) {{session: session_id}}

    before do
      allow(HocLegacy::TutorialCompleter).to receive(:call).with(controller: instance_of(described_class)).and_return(session_row)
    end

    it 'finishes current tutorial and redirects to congrats page for completed tutorial' do
      expect(HocLegacy::TutorialCompleter).to receive(:call).
        with(controller: instance_of(described_class)).
        and_return(session_row)

      finish_current_tutorial_request

      must_respond_with :found
      must_redirect_to "https://test-studio.code.org/congrats?i=#{session_id}"
    end

    it 'disables caching' do
      finish_current_tutorial_request
      must_disable_caching
    end

    context 'when no tutorial is launched' do
      let(:session_row) {nil}

      it 'finishes current tutorial and redirects to congrats page without any params' do
        expect(HocLegacy::TutorialCompleter).to receive(:call).
          with(controller: instance_of(described_class)).
          and_return(session_row)

        finish_current_tutorial_request

        must_respond_with :found
        must_redirect_to 'https://test-studio.code.org/congrats'
      end
    end

    context 'when tracking is disabled' do
      before do
        allow(CDO).to receive(:hoc_tracking_enabled).and_return(false)
      end

      it 'does not finishes current tutorial and redirects to congrats page without any params' do
        expect(HocLegacy::TutorialCompleter).not_to receive(:call).
          with(controller: instance_of(described_class))

        finish_current_tutorial_request

        must_respond_with :found
        must_redirect_to 'https://test-studio.code.org/congrats'
      end
    end
  end

  describe 'GET /api/hour/finish/:code' do
    subject(:finish_tutorial_request) {get "/api/hour/finish/#{tutorial_code}"}

    let(:tutorial_code) {'tutorial_code'}
    let(:encoded_tutorial_code) {CGI.escape(Base64.urlsafe_encode64(tutorial_code))}
    let(:tutorial) {OpenStruct.new(tutorial_id: tutorial_code)}

    let(:session_id) {Faker::Internet.unique.uuid}
    let(:session_row) {{session: session_id}}

    before do
      allow(HocLegacy::Tutorials).to receive(:get).with(tutorial_code).and_return(tutorial)
      allow(HocLegacy::TutorialCompleter).to receive(:call).
        with(controller: instance_of(described_class), tutorial:).
        and_return(session_row)
    end

    it 'finishes tutorial and redirects to congrats page for completed tutorial' do
      expect(HocLegacy::TutorialCompleter).to receive(:call).
        with(controller: instance_of(described_class), tutorial:).
        and_return(session_row)

      finish_tutorial_request

      must_respond_with :found
      must_redirect_to "https://test-studio.code.org/congrats?i=#{session_id}&s=#{encoded_tutorial_code}"
    end

    it 'disables caching' do
      finish_tutorial_request
      must_disable_caching
    end

    context 'when no tutorial is launched' do
      let(:session_row) {nil}

      it 'finishes current tutorial and redirects to congrats page with tutorial code only' do
        expect(HocLegacy::TutorialCompleter).to receive(:call).
          with(controller: instance_of(described_class), tutorial:).
          and_return(session_row)

        finish_tutorial_request

        must_respond_with :found
        must_redirect_to "https://test-studio.code.org/congrats?s=#{encoded_tutorial_code}"
      end
    end

    context 'when no tutorial is found' do
      let(:tutorial) {nil}

      it 'returns error 404' do
        finish_tutorial_request

        must_respond_with :not_found
        must_select 'h1', '404: Page Not Found'

        expect(HocLegacy::TutorialCompleter).not_to have_received(:call)
      end
    end

    context 'when tracking is disabled' do
      before do
        allow(CDO).to receive(:hoc_tracking_enabled).and_return(false)
      end

      it 'does not finish current tutorial and redirects to congrats page without any params' do
        expect(HocLegacy::TutorialCompleter).not_to receive(:call).
          with(controller: instance_of(described_class), tutorial:)

        finish_tutorial_request

        must_respond_with :found
        must_redirect_to "https://test-studio.code.org/congrats"
      end
    end
  end

  describe 'GET /api/hour/finish_:code.png' do
    subject(:finish_tutorial_pixel_request) {get "/api/hour/finish_#{tutorial_code}.png"}

    let(:tutorial_code) {'tutorial_code'}
    let(:tutorial) {OpenStruct.new(tutorial_id: tutorial_code)}

    before do
      allow(HocLegacy::Tutorials).to receive(:get).with(tutorial_code).and_return(tutorial)
      allow(HocLegacy::TutorialPixelCompleter).to receive(:call)
    end

    it 'launches tutorial pixel' do
      finish_tutorial_pixel_request
      expect(HocLegacy::TutorialPixelCompleter).to have_received(:call).with(controller:, tutorial:).once
    end

    it 'sends pixel png file' do
      finish_tutorial_pixel_request

      must_respond_with :success

      _(response.content_type).must_equal 'image/png'
      _(response.headers['Content-Disposition']).must_equal %q[inline; filename="1x1.png"; filename*=UTF-8''1x1.png]
      _(response.body.bytesize).must_equal 110 # Size of 1x1.png
    end

    it 'disables caching' do
      finish_tutorial_pixel_request
      must_disable_caching
    end

    context 'when no tutorial is found' do
      let(:tutorial) {nil}

      it 'returns error 404' do
        finish_tutorial_pixel_request
        must_respond_with :not_found
        expect(HocLegacy::TutorialPixelCompleter).not_to have_received(:call)
      end
    end

    context 'when tracking is disabled' do
      before do
        allow(CDO).to receive(:hoc_tracking_enabled).and_return(false)
      end

      it 'does not launch tutorial pixel' do
        finish_tutorial_pixel_request
        expect(HocLegacy::TutorialPixelCompleter).not_to have_received(:call).with(controller:, tutorial:)
      end

      it 'sends pixel png file' do
        finish_tutorial_pixel_request

        must_respond_with :success

        _(response.content_type).must_equal 'image/png'
        _(response.headers['Content-Disposition']).must_equal %q[inline; filename="1x1.png"; filename*=UTF-8''1x1.png]
        _(response.body.bytesize).must_equal 110 # Size of 1x1.png
      end
    end
  end

  private def must_disable_caching
    cache_control = response.headers['Cache-Control']
    _(cache_control).must_include 'max-age=0'
    _(cache_control).must_include 'must-revalidate'
    _(cache_control).must_include 'private'
  end
end
