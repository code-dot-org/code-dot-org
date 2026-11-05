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

  before do
    User.any_instance.stubs(:can_use_lesson_deep_dive?).returns(true)
  end

  describe 'GET #index' do
    context 'when not signed in' do
      it 'redirects to sign in' do
        get :index
        assert_redirected_to_sign_in
      end
    end

    context 'when signed in without lesson deep dive access' do
      before do
        User.any_instance.stubs(:can_use_lesson_deep_dive?).returns(false)
        sign_in user
      end

      it 'is forbidden' do
        get :index
        assert_response :forbidden
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
          whiteboard_starter_image_key: 'grid',
          whiteboard_starter_image_alt_text: 'a number grid',
        )
        get :index, params: {lesson_id: lesson.id}

        assert_response :success
        entry = response_json.find {|c| c['id'] == detailed.id}
        _(entry['lesson_id']).must_equal lesson.id
        _(entry['question']).must_equal 'What is 2 + 2?'
        _(entry['default_modality']).must_equal 'whiteboard'
        _(entry['whiteboard_starter_image_alt_text']).must_equal 'a number grid'
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
        challenge.update!(whiteboard_starter_image_key: 'grid', whiteboard_starter_image_alt_text: 'a grid')
        AWS::S3.stubs(:download_from_bucket).
          with('images.code.org', 'challenge_starter_images/grid.png').
          returns('png-bytes')

        get :starter_image, params: {id: challenge.id}

        assert_response :success
        _(response.media_type).must_equal 'image/png'
        _(response.body).must_equal 'png-bytes'
      end

      it 'returns 404 when the challenge has no starter image' do
        AWS::S3.expects(:download_from_bucket).never

        get :starter_image, params: {id: challenge.id}

        assert_response :not_found
      end

      it 'returns 404 when the starter image object is missing' do
        challenge.update!(whiteboard_starter_image_key: 'grid', whiteboard_starter_image_alt_text: 'a grid')
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

  describe 'authoring' do
    let(:png_bytes) {'png-bytes'.b}
    let(:challenge_input) do
      {
        question: 'Draw a cat.',
        default_modality: 'whiteboard',
        rubric: [{level: 0, description: 'No cat'}, {level: 1, description: 'A cat'}],
        whiteboard_starter_image_alt_text: 'an empty box',
      }
    end

    def upload(bytes, content_type: 'image/png')
      file = Tempfile.new(['starter', '.png'])
      file.binmode
      file.write(bytes)
      file.rewind
      Rack::Test::UploadedFile.new(file.path, content_type, true)
    end

    context 'as a student' do
      before {sign_in user}

      it 'cannot create' do
        post :create, params: {lesson_id: lesson.id, challenge_json: challenge_input.to_json}
        assert_response :forbidden
      end
    end

    context 'as a levelbuilder' do
      before {sign_in create(:levelbuilder)}

      describe 'POST #create' do
        it 'creates a challenge with a generated key and uploads the starter image' do
          AWS::S3.expects(:upload_to_bucket).with(
            'images.code.org',
            regexp_matches(%r{\Achallenge_starter_images/challenge-lesson-#{lesson.id}-\h+-\h+\.png\z}),
            png_bytes,
            has_entries(no_random: true, acl: 'public-read')
          )

          post :create, params: {lesson_id: lesson.id, challenge_json: challenge_input.to_json, starter_image: upload(png_bytes)}

          assert_response :success
          created = Challenge.find(response_json['id'])
          _(created.key).must_match(/\Achallenge-lesson-#{lesson.id}-\h+\z/)
          _(created.lesson).must_equal lesson
          _(created.rubric).must_equal [{'level' => 0, 'description' => 'No cat'}, {'level' => 1, 'description' => 'A cat'}]
          _(created.whiteboard_starter_image_key).must_match(/\A#{created.key}-\h+\z/)
          _(response_json['whiteboardStarterImageUrl']).must_equal "/challenges/#{created.id}/starter_image"
        end

        it 'creates a challenge without a starter image' do
          AWS::S3.expects(:upload_to_bucket).never

          post :create, params: {lesson_id: lesson.id, challenge_json: challenge_input.except(:whiteboard_starter_image_alt_text).to_json}

          assert_response :success
          _(Challenge.find(response_json['id']).whiteboard_starter_image_key).must_be_nil
        end

        it 'rejects invalid JSON' do
          post :create, params: {lesson_id: lesson.id, challenge_json: '{not json'}
          assert_response :bad_request
        end

        it 'rejects fields outside the editable set, including a key' do
          assert_no_difference 'Challenge.count' do
            post :create, params: {lesson_id: lesson.id, challenge_json: challenge_input.merge(key: '../../evil').to_json}
          end
          assert_response :bad_request
          _(response.body).must_include 'key'
        end

        it 'rejects an unknown modality' do
          post :create, params: {lesson_id: lesson.id, challenge_json: challenge_input.merge(default_modality: 'interpretive-dance').to_json}
          assert_response :bad_request
        end

        it 'does not upload when the challenge is invalid' do
          AWS::S3.expects(:upload_to_bucket).never

          post :create, params: {lesson_id: lesson.id, challenge_json: challenge_input.merge(rubric: []).to_json, starter_image: upload(png_bytes)}

          assert_response :bad_request
        end

        it 'rejects a starter image that is not a PNG' do
          AWS::S3.expects(:upload_to_bucket).never

          post :create, params: {lesson_id: lesson.id, challenge_json: challenge_input.to_json, starter_image: upload('GIF89a'.b, content_type: 'image/gif')}

          assert_response :unsupported_media_type
        end

        it 'rejects a starter image larger than 2MB' do
          AWS::S3.expects(:upload_to_bucket).never

          post :create, params: {lesson_id: lesson.id, challenge_json: challenge_input.to_json, starter_image: upload(png_bytes + ('x' * 2.megabytes).b)}

          assert_response :payload_too_large
        end
      end

      describe 'PATCH #update' do
        let(:imaged) do
          create(:challenge, lesson:, whiteboard_starter_image_key: 'old', whiteboard_starter_image_alt_text: 'old')
        end

        it 'updates the fields and keeps the key and image' do
          patch :update, params: {id: imaged.id, challenge_json: challenge_input.merge(question: 'Draw a dog.').to_json}

          assert_response :success
          imaged.reload
          _(imaged.question).must_equal 'Draw a dog.'
          _(imaged.key).must_equal response_json['key']
          _(imaged.whiteboard_starter_image_key).must_equal 'old'
        end

        it 'stores a replacement image under a new key' do
          AWS::S3.expects(:upload_to_bucket).once

          patch :update, params: {id: imaged.id, challenge_json: challenge_input.to_json, starter_image: upload(png_bytes)}

          assert_response :success
          _(imaged.reload.whiteboard_starter_image_key).wont_equal 'old'
        end

        it 'removes the starter image' do
          patch :update, params: {id: imaged.id, challenge_json: challenge_input.to_json, remove_starter_image: '1'}

          assert_response :success
          imaged.reload
          _(imaged.whiteboard_starter_image_key).must_be_nil
          _(imaged.whiteboard_starter_image_alt_text).must_be_nil
        end

        it 'rejects a key in the JSON' do
          patch :update, params: {id: imaged.id, challenge_json: challenge_input.merge(key: 'other').to_json}

          assert_response :bad_request
          _(imaged.reload.key).wont_equal 'other'
        end
      end

      describe 'DELETE #destroy' do
        it 'deletes a challenge without responses' do
          delete :destroy, params: {id: challenge.id}

          assert_response :success
          _(response_json['deleted']).must_equal true
          _(Challenge.exists?(challenge.id)).must_equal false
        end

        it 'refuses to delete a challenge with responses' do
          create(:challenge_response, challenge:)

          delete :destroy, params: {id: challenge.id}

          assert_response :conflict
          _(Challenge.exists?(challenge.id)).must_equal true
        end
      end
    end
  end
end
