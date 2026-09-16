require 'test_helper'

class ChallengesControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  let(:user) {create(:student)}

  let(:lesson) {create(:lesson)}
  let(:other_lesson) {create(:lesson)}

  let!(:challenge) {create(:challenge, lesson:)}
  let!(:other_challenge) {create(:challenge, lesson:)}
  let!(:challenge_in_other_lesson) {create(:challenge, lesson: other_lesson)}

  let(:response_json) {JSON.parse(response.body)}
  let(:response_ids) {response_json.map {|c| c['id']}}

  describe 'GET #index' do
    context 'when not signed in' do
      it 'redirects to sign in' do
        get :index
        assert_redirected_to_sign_in
      end
    end

    context 'when signed in' do
      before {sign_in user}

      it 'returns all challenges when no lesson_id param given' do
        get :index

        assert_response :success
        _(response_ids).must_include challenge.id
        _(response_ids).must_include other_challenge.id
        _(response_ids).must_include challenge_in_other_lesson.id
      end

      it 'returns only challenges for the given lesson_id' do
        get :index, params: {lesson_id: lesson.id}

        assert_response :success
        _(response_ids).must_include challenge.id
        _(response_ids).must_include other_challenge.id
        _(response_ids).wont_include challenge_in_other_lesson.id
      end

      it 'returns an empty array when no challenges match the given lesson_id' do
        empty_lesson = create(:lesson)
        get :index, params: {lesson_id: empty_lesson.id}

        assert_response :success
        _(response_json).must_be_empty
      end

      it 'includes the summarized challenge fields' do
        detailed = create(
          :challenge,
          lesson:,
          question: 'What is 2 + 2?',
          default_modality: 'whiteboard',
          whiteboard_starter_image_alt_text: 'a number grid',
        )
        get :index, params: {lesson_id: lesson.id}

        assert_response :success
        entry = response_json.find {|c| c['id'] == detailed.id}
        _(entry['lesson_id']).must_equal lesson.id
        _(entry['question']).must_equal 'What is 2 + 2?'
        _(entry['default_modality']).must_equal 'whiteboard'
        _(entry['whiteboard_starter_image_alt_text']).must_equal 'a number grid'
        # Alt text present => the same-origin starter-image URL is served.
        _(entry['whiteboard_starter_image_url']).must_equal "/challenges/#{detailed.id}/starter_image"
      end

      it 'omits the starter-image URL when the challenge has no starter image' do
        get :index, params: {lesson_id: lesson.id}

        assert_response :success
        entry = response_json.find {|c| c['id'] == challenge.id}
        _(entry['whiteboard_starter_image_url']).must_be_nil
      end
    end
  end

  describe 'GET #starter_image' do
    context 'when not signed in' do
      it 'redirects to sign in' do
        get :starter_image, params: {id: challenge.id}
        assert_redirected_to_sign_in
      end
    end

    context 'when signed in' do
      before {sign_in user}

      it 'streams the starter image bytes as a PNG' do
        AWS::S3.stubs(:user_content_bucket).returns('test-user-content')
        AWS::S3.stubs(:download_from_bucket).
          with('test-user-content', "challenge_starter_images/#{challenge.id}.png").
          returns('png-bytes')

        get :starter_image, params: {id: challenge.id}

        assert_response :success
        _(response.media_type).must_equal 'image/png'
        _(response.body).must_equal 'png-bytes'
      end

      it 'returns 404 when no starter image was uploaded' do
        AWS::S3.stubs(:user_content_bucket).returns('test-user-content')
        AWS::S3.stubs(:download_from_bucket).raises(AWS::S3::NoSuchKey.new('missing'))

        get :starter_image, params: {id: challenge.id}

        assert_response :not_found
      end
    end
  end

  describe 'GET #show' do
    context 'when not signed in' do
      it 'redirects to sign in' do
        get :show, params: {id: challenge.id}
        assert_redirected_to_sign_in
      end
    end

    context 'when signed in' do
      before {sign_in user}

      it 'returns the challenge' do
        get :show, params: {id: challenge.id}

        assert_response :success
        _(response_json['id']).must_equal challenge.id
      end
    end
  end
end
