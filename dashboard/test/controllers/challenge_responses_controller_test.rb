require 'test_helper'

class ChallengeResponsesControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers
  include ActiveJob::TestHelper

  let(:student) {create(:student)}
  let(:teacher) {create(:teacher)}
  let(:other_student) {create(:student)}

  let(:challenge) {create(:challenge)}

  let(:response_json) {JSON.parse(response.body)}

  before do
    AWS::S3.stubs(:user_content_bucket).returns('test-user-content')
    AWS::S3.stubs(:presigned_download_url).returns('https://s3.example/download')
  end

  describe 'POST #create' do
    context 'when not signed in' do
      it 'redirects to sign in' do
        post :create, params: {challenge_id: challenge.id}
        assert_redirected_to_sign_in
      end
    end

    context 'when signed in as a student' do
      before {sign_in student}

      it 'creates a response owned by the current user' do
        assert_difference 'ChallengeResponse.count', 1 do
          post :create, params: {challenge_id: challenge.id, student_text: 'my answer'}
        end

        assert_response :created
        _(response_json['challenge_id']).must_equal challenge.id
        _(response_json['user_id']).must_equal student.id
        _(response_json['student_text']).must_equal 'my answer'
      end

      it 'creates a response owned by the current user, including transcript' do
        assert_difference 'ChallengeResponse.count', 1 do
          post :create, params: {challenge_id: challenge.id, transcript: 'beep boop'}
        end

        assert_response :created
        _(response_json['challenge_id']).must_equal challenge.id
        _(response_json['user_id']).must_equal student.id
        _(response_json['transcript']).must_equal 'beep boop'
      end

      it 'creates an asset row per asset_type, without download URLs' do
        assert_difference 'ChallengeResponseAsset.count', 2 do
          post :create, params: {
            challenge_id: challenge.id,
            assets: [{asset_type: 'whiteboard_image'}, {asset_type: 'video'}],
          }
        end

        assert_response :created
        assets = response_json['assets']
        _(assets.map {|a| a['asset_type']}).must_equal %w[whiteboard_image video]
        # The bytes are not in S3 yet; the client PUTs them to the upload
        # endpoint using these ids.
        assets.each do |asset|
          _(asset['id']).wont_be_nil
          _(asset).wont_include 'download_url'
        end
      end

      it 'ignores server-owned fields' do
        post :create, params: {
          challenge_id: challenge.id,
          student_feedback: 'sneaky',
          evaluation_result: {score: 5},
        }

        assert_response :created
        created = ChallengeResponse.find(response_json['id'])
        _(created.student_feedback).must_be_nil
        _(created.evaluation_result).must_be_nil
      end

      it 'returns bad_request for an invalid asset_type' do
        assert_no_difference 'ChallengeResponse.count' do
          post :create, params: {challenge_id: challenge.id, assets: [{asset_type: 'bogus'}]}
        end

        assert_response :bad_request
      end
    end
  end

  describe 'GET #show' do
    let(:challenge_response) {create(:challenge_response, challenge:, user: student)}
    let!(:asset) {create(:challenge_response_asset, challenge_response:)}

    context 'when not signed in' do
      it 'redirects to sign in' do
        get :show, params: {id: challenge_response.id}
        assert_redirected_to_sign_in
      end
    end

    context 'when signed in as the owner student' do
      before {sign_in student}

      it 'returns the response with its assets and download URLs' do
        get :show, params: {id: challenge_response.id}

        assert_response :success
        _(response_json['id']).must_equal challenge_response.id
        _(response_json['user_id']).must_equal student.id
        _(response_json['assets'].length).must_equal 1
        _(response_json['assets'].first['download_url']).must_equal 'https://s3.example/download'
      end

      it 'includes their feedback and status but not the scored evaluation' do
        challenge_response.update!(
          evaluation_result: {'level' => 2},
          student_feedback: 'Nice work!',
          evaluation_status: :success
        )

        get :show, params: {id: challenge_response.id}

        assert_response :success
        _(response_json['student_feedback']).must_equal 'Nice work!'
        _(response_json['evaluation_status']).must_equal 'success'
        %w[evaluation_result evaluated_at].each do |field|
          _(response_json).wont_include field
        end
      end
    end

    context "when signed in as the student's teacher" do
      before do
        create(:follower, section: create(:section, user: teacher), student_user: student)
        sign_in teacher
      end

      it 'returns the response including the evaluation fields' do
        challenge_response.update!(evaluation_result: {'level' => 2}, evaluation_status: :success)

        get :show, params: {id: challenge_response.id}

        assert_response :success
        _(response_json['id']).must_equal challenge_response.id
        _(response_json['evaluation_result']).must_equal({'level' => 2})
        _(response_json['evaluation_status']).must_equal 'success'
      end
    end

    context 'when signed in as an unrelated student' do
      before {sign_in other_student}

      it 'is forbidden' do
        get :show, params: {id: challenge_response.id}
        assert_response :forbidden
      end
    end
  end

  describe 'POST #evaluate' do
    let(:challenge) {create(:challenge, :with_rubric)}
    let(:challenge_response) {create(:challenge_response, challenge:, user: student, is_final: true)}

    context 'when signed in as the owner student' do
      before {sign_in student}

      it 'enqueues an evaluation job and returns accepted' do
        assert_enqueued_with job: EvaluateChallengeResponseJob,
          args: [{challenge_response_id: challenge_response.id}] do
          post :evaluate, params: {id: challenge_response.id}
        end

        assert_response :accepted
      end

      it 'rejects a challenge with no rubric' do
        challenge.update!(rubric: nil)

        assert_no_enqueued_jobs do
          post :evaluate, params: {id: challenge_response.id}
        end

        assert_response :unprocessable_entity
      end

      it 'rejects a response that is not a final submission' do
        challenge_response.update!(is_final: false)

        assert_no_enqueued_jobs do
          post :evaluate, params: {id: challenge_response.id}
        end

        assert_response :unprocessable_entity
      end

      it 'rejects a response whose asset bytes are not uploaded yet' do
        create(:challenge_response_asset, challenge_response:)
        AWS::S3.stubs(:exists_in_bucket).returns(false)

        assert_no_enqueued_jobs do
          post :evaluate, params: {id: challenge_response.id}
        end

        assert_response :unprocessable_entity
      end

      it 'rejects a duplicate request while an evaluation is queued or finished' do
        challenge_response.update!(evaluation_status: :queued)

        assert_no_enqueued_jobs do
          post :evaluate, params: {id: challenge_response.id}
        end

        assert_response :conflict
      end

      it 'allows re-requesting after a failed evaluation' do
        challenge_response.update!(evaluation_status: :failure)

        assert_enqueued_with job: EvaluateChallengeResponseJob do
          post :evaluate, params: {id: challenge_response.id}
        end

        assert_response :accepted
      end
    end

    context "when signed in as the student's teacher" do
      before do
        create(:follower, section: create(:section, user: teacher), student_user: student)
        sign_in teacher
      end

      it 'is forbidden' do
        assert_no_enqueued_jobs do
          post :evaluate, params: {id: challenge_response.id}
        end

        assert_response :forbidden
      end
    end
  end
end
