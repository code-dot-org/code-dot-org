# frozen_string_literal: true

require 'test_helper'

class HocLegacy::TutorialsControllerTest < ActionDispatch::IntegrationTest
  include Minitest::RSpecMocks

  before do
    allow(DCDO).to receive(:get).and_call_original
  end

  describe 'GET /api/hour/begin/:code' do
    subject(:begin_tutorial_request) {get "/api/hour/begin/#{tutorial_code}"}

    let(:tutorial_code) {'tutorial_code'}
    let(:tutorial_url) {'https://studio.code.org/expected/tutorial_url'}
    let(:tutorial_primary_ref) {OpenStruct.new(primary_target: tutorial_url)}
    let(:tutorial) {OpenStruct.new(tutorial_id: tutorial_code, primary_link_ref: tutorial_primary_ref)}

    let(:pegasus_db_mock) {double(:pegasus_db)}
    let(:forms_table_mock) {double(:forms_table)}

    before do
      allow(CDO).to receive(:default_scheme).and_return('https:')
      allow(DCDO).to receive(:get).with('hoc_apis_in_dashboard', anything).and_return(true)

      allow(CdoContentful::CsForAll::Entry::Tutorial).to receive(:find_by_code)
      allow(CdoContentful::CsForAll::Entry::Tutorial).to receive(:find_by_code).with(tutorial_code).and_return(tutorial)
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

    context 'when DCDO hoc_apis_in_dashboard is false' do
      before do
        allow(DCDO).to receive(:get).with('hoc_apis_in_dashboard', anything).and_return(false)
      end

      it 'does not launch tutorial' do
        begin_tutorial_request
        expect(HocLegacy::TutorialLauncher).not_to have_received(:call)
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
    end
  end

  describe 'GET /api/hour/begin_:code.png' do
    subject(:begin_tutorial_pixel_request) {get "/api/hour/begin_#{tutorial_code}.png"}

    let(:tutorial_code) {'tutorial_code'}
    let(:tutorial) {OpenStruct.new(tutorial_id: tutorial_code)}

    before do
      allow(DCDO).to receive(:get).with('hoc_apis_in_dashboard', anything).and_return(true)

      allow(CdoContentful::CsForAll::Entry::Tutorial).to receive(:find_by_code).with(tutorial_code).and_return(tutorial)
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

    context 'when DCDO hoc_apis_in_dashboard is false' do
      before do
        allow(DCDO).to receive(:get).with('hoc_apis_in_dashboard', anything).and_return(false)
      end

      it 'does not launch tutorial pixel' do
        begin_tutorial_pixel_request
        expect(HocLegacy::TutorialPixelLauncher).not_to have_received(:call)
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
    end
  end

  describe 'GET /api/hour/finish' do
    subject(:finish_current_tutorial_request) {get '/api/hour/finish'}

    let(:session_id) {Faker::Internet.unique.uuid}
    let(:session_row) {{session: session_id}}

    before do
      allow(DCDO).to receive(:get).with('hoc_apis_in_dashboard', anything).and_return(true)

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

    context 'when DCDO hoc_apis_in_dashboard is false' do
      before do
        allow(DCDO).to receive(:get).with('hoc_apis_in_dashboard', anything).and_return(false)
      end

      it 'does not finish current tutorial and redirects to congrats page for completed tutorial' do
        expect(HocLegacy::TutorialCompleter).not_to receive(:call)

        finish_current_tutorial_request

        must_respond_with :found
        must_redirect_to 'https://test-studio.code.org/congrats'
      end

      it 'disables caching' do
        finish_current_tutorial_request
        must_disable_caching
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
      allow(DCDO).to receive(:get).with('hoc_apis_in_dashboard', anything).and_return(true)

      allow(CdoContentful::CsForAll::Entry::Tutorial).to receive(:find_by_code).with(tutorial_code).and_return(tutorial)
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
      must_redirect_to(
        "https://test-studio.code.org/congrats?i=#{session_id}&s=#{encoded_tutorial_code}"
      )
    end

    it 'disables caching' do
      finish_tutorial_request
      must_disable_caching
    end

    context 'when no tutorial is launched' do
      let(:session_row) {nil}

      it 'finishes current tutorial and redirects to congrats page without tutorial code only' do
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

    context 'when DCDO hoc_apis_in_dashboard is false' do
      before do
        allow(DCDO).to receive(:get).with('hoc_apis_in_dashboard', anything).and_return(false)
      end

      it 'does not finish tutorial and redirects to congrats page for completed tutorial' do
        expect(HocLegacy::TutorialCompleter).not_to receive(:call)
        finish_tutorial_request

        must_respond_with :found
        must_redirect_to "https://test-studio.code.org/congrats?s=#{encoded_tutorial_code}"
      end

      it 'disables caching' do
        finish_tutorial_request
        must_disable_caching
      end
    end
  end

  describe 'GET /api/hour/finish_:code.png' do
    subject(:finish_tutorial_pixel_request) {get "/api/hour/finish_#{tutorial_code}.png"}

    let(:tutorial_code) {'tutorial_code'}
    let(:tutorial) {OpenStruct.new(tutorial_id: tutorial_code)}

    before do
      allow(DCDO).to receive(:get).with('hoc_apis_in_dashboard', anything).and_return(true)

      allow(CdoContentful::CsForAll::Entry::Tutorial).to receive(:find_by_code).with(tutorial_code).and_return(tutorial)
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

    context 'when DCDO hoc_apis_in_dashboard is false' do
      before do
        allow(DCDO).to receive(:get).with('hoc_apis_in_dashboard', anything).and_return(false)
      end

      it 'does not launch tutorial pixel' do
        finish_tutorial_pixel_request
        expect(HocLegacy::TutorialPixelCompleter).not_to have_received(:call)
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
    end
  end

  %w[/api/hour/certificate /v2/certificate].each do |post_certificate_path|
    describe "POST #{post_certificate_path}" do
      subject(:post_certificate_request) {post post_certificate_path, params: request_params}

      let(:param_session_id) {session_id}
      let(:param_name) {'param_name'}
      let(:request_params) {{session_s: param_session_id, name_s: "  #{param_name}  "}}

      let(:session_id) {Faker::Internet.unique.uuid}
      let(:session_name) {nil}
      let(:session_tutorial) {'session_tutorial'}
      let(:session_company) {'session_company'}
      let(:session_started_at) {4.hours.ago}
      let(:session_pixel_started_at) {3.hours.ago}
      let(:session_pixel_finished_at) {2.hours.ago}
      let(:session_finished_at) {1.hour.ago}

      let(:session_row_query) {PEGASUS_DB[:hoc_activity].where(session: session_id)}
      let(:parsed_response) {JSON.parse(response.body)}

      around do |test|
        PEGASUS_DB.transaction(rollback: :always) {test.call}
      end

      before do
        PEGASUS_DB[:hoc_activity].insert(
          session: session_id,
          name: session_name,
          tutorial: session_tutorial,
          company: session_company,
          started_at: session_started_at,
          pixel_started_at: session_pixel_started_at,
          pixel_finished_at: session_pixel_finished_at,
          finished_at: session_finished_at,
        )
      end

      it 'updates session row with name from params' do
        _ {post_certificate_request}.must_change -> {session_row_query.first[:name]}, from: session_name, to: param_name
      end

      it 'returns JSON response with session status with updated session name' do
        post_certificate_request

        must_respond_with :success
        _(response.content_type).must_include 'application/json'

        _(parsed_response).must_equal(
          {
            'session' => session_id,
            'tutorial' => session_tutorial,
            'company' => session_company,
            'started' => true,
            'pixel_started' => true,
            'pixel_finished' => true,
            'finished' => true,
            'name' => param_name,
            'certificate_sent' => true,
          }
        )
      end

      context 'when name param is blank' do
        let(:param_name) {''}

        it 'does not update session row with name from params' do
          _ {post_certificate_request}.wont_change -> {session_row_query.first[:name]}
        end

        it 'returns JSON response with session status with initial name' do
          post_certificate_request
          must_respond_with :success
          _(parsed_response['name']).must_be_nil
          _(parsed_response['certificate_sent']).must_equal false
        end
      end

      context 'when session row already has name' do
        let(:session_name) {'session_name'}

        it 'does not update session row with name from params' do
          _ {post_certificate_request}.wont_change -> {session_row_query.first[:name]}
        end

        it 'returns JSON response with session status with initial session name' do
          post_certificate_request
          must_respond_with :success
          _(parsed_response['name']).must_equal session_name
        end
      end

      %w[tutorial company].freeze.each do |attr|
        context "when session row has no #{attr}" do
          let(:"session_#{attr}") {nil}

          it "returns JSON response with session status with #{attr} nil" do
            post_certificate_request
            must_respond_with :success
            _(parsed_response.key?(attr)).must_equal true
            _(parsed_response[attr]).must_be_nil
          end
        end
      end

      %w[started pixel_started pixel_finished finished].freeze.each do |attr|
        context "when session row has no #{attr}_at" do
          let(:"session_#{attr}_at") {nil}

          it "returns JSON response with session status with #{attr} false" do
            post_certificate_request
            must_respond_with :success
            _(parsed_response.key?(attr)).must_equal true
            _(parsed_response[attr]).must_equal false
          end
        end
      end

      context 'when session row does not exist' do
        let(:param_session_id) {'unexisted_session_id'}

        it 'returns JSON response with default status' do
          post_certificate_request

          must_respond_with :success
          _(response.content_type).must_include 'application/json'

          _(parsed_response).must_equal(
            {
              'session' => nil,
              'tutorial' => nil,
              'company' => nil,
              'started' => false,
              'pixel_started' => false,
              'pixel_finished' => false,
              'finished' => false,
              'name' => nil,
              'certificate_sent' => false,
            }
          )
        end
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
