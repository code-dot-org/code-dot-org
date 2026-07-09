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
end
