require 'test_helper'

class ChallengeResponseAssetsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  let(:student) {create(:student)}
  let(:teacher) {create(:teacher)}
  let(:other_student) {create(:student)}

  let(:challenge_response) {create(:challenge_response, user: student)}
  let(:asset) {create(:challenge_response_asset, challenge_response:)}

  let(:response_json) {JSON.parse(response.body)}

  before do
    AWS::S3.stubs(:user_content_bucket).returns('test-user-content')
    AWS::S3.stubs(:presigned_download_url).returns('https://s3.example/download')
  end

  describe 'GET #show' do
    context 'when not signed in' do
      it 'redirects to sign in' do
        get :show, params: {id: asset.id}
        assert_redirected_to_sign_in
      end
    end

    context 'when signed in as the owner student' do
      before {sign_in student}

      it 'returns the asset with a download URL' do
        get :show, params: {id: asset.id}

        assert_response :success
        _(response_json['id']).must_equal asset.id
        _(response_json['asset_type']).must_equal asset.asset_type
        _(response_json['download_url']).must_equal 'https://s3.example/download'
      end
    end

    context "when signed in as the student's teacher" do
      before do
        create(:follower, section: create(:section, user: teacher), student_user: student)
        sign_in teacher
      end

      it 'returns the asset' do
        get :show, params: {id: asset.id}

        assert_response :success
        _(response_json['id']).must_equal asset.id
      end
    end

    context 'when signed in as an unrelated student' do
      before {sign_in other_student}

      it 'is forbidden' do
        get :show, params: {id: asset.id}
        assert_response :forbidden
      end
    end
  end

  describe 'PUT #upload' do
    def put_upload(id, body: 'png-bytes', content_type: 'image/png')
      @request.headers['CONTENT_TYPE'] = content_type
      put :upload, params: {id: id}, body: body
    end

    context 'when not signed in' do
      it 'redirects to sign in' do
        put_upload asset.id
        assert_redirected_to_sign_in
      end
    end

    context 'when signed in as the owner student' do
      before {sign_in student}

      it 'stores the bytes at the asset s3_key and returns a download URL' do
        AWS::S3.expects(:upload_to_bucket).with(
          'test-user-content', asset.s3_key, 'png-bytes',
          no_random: true, content_type: 'image/png'
        )

        put_upload asset.id

        assert_response :success
        _(response_json['id']).must_equal asset.id
        _(response_json['download_url']).must_equal 'https://s3.example/download'
      end

      it 'rejects a content type not allowed for the asset type' do
        AWS::S3.expects(:upload_to_bucket).never

        put_upload asset.id, content_type: 'application/pdf'

        assert_response :unsupported_media_type
      end

      it 'rejects an empty body' do
        AWS::S3.expects(:upload_to_bucket).never

        put_upload asset.id, body: ''

        assert_response :bad_request
      end

      it 'rejects a body over the size limit' do
        ChallengeResponseAsset.stubs(:max_upload_bytes).returns(4)
        AWS::S3.expects(:upload_to_bucket).never

        put_upload asset.id, body: 'way past the limit'

        assert_response :payload_too_large
      end
    end

    context "when signed in as the student's teacher" do
      before do
        create(:follower, section: create(:section, user: teacher), student_user: student)
        sign_in teacher
      end

      it 'is forbidden (teachers only read)' do
        put_upload asset.id
        assert_response :forbidden
      end
    end

    context 'when signed in as an unrelated student' do
      before {sign_in other_student}

      it 'is forbidden' do
        put_upload asset.id
        assert_response :forbidden
      end
    end
  end
end
