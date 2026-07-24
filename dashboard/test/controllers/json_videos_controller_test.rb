require 'test_helper'

class JSONVideosControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @student = create(:student)
    @video = create(:json_video, key: 'test-video', s3_uri: 's3://my-bucket/path/to/video.json')
  end

  # content is accessible to any authenticated user (no levelbuilder restriction)

  test 'unauthenticated request to content redirects' do
    get :content, params: {id: @video.key}
    assert_response :redirect
  end

  test 'content returns 404 for unknown key' do
    sign_in @student
    get :content, params: {id: 'does-not-exist'}
    assert_response :not_found
  end

  test 'content returns json body for known key' do
    sign_in @student
    AWS::S3.stubs(:download_from_bucket).with('my-bucket', 'path/to/video.json').returns('{"frames":[]}')

    get :content, params: {id: @video.key}

    assert_response :success
    assert_includes response.content_type, 'application/json'
    assert_equal '{"frames":[]}', response.body
  end

  test 'content returns 502 when S3 raises' do
    sign_in @student
    AWS::S3.stubs(:download_from_bucket).raises(RuntimeError, 'connection error')

    get :content, params: {id: @video.key}

    assert_response :bad_gateway
  end

  # search and create are levelbuilder-only

  test_user_gets_response_for :search, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :search, user: :student, response: :forbidden
  test_user_gets_response_for :search, user: :teacher, response: :forbidden
  test_user_gets_response_for :search, user: :levelbuilder, response: :success

  test_user_gets_response_for :create, method: :post, params: -> {{key: 'new-unique-video', s3_uri: 's3://b/k.json', json_schema_version: 1, audience: 'Student'}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :create, method: :post, params: -> {{key: 'new-unique-video', s3_uri: 's3://b/k.json', json_schema_version: 1, audience: 'Student'}}, user: :student, response: :forbidden
  test_user_gets_response_for :create, method: :post, params: -> {{key: 'new-unique-video', s3_uri: 's3://b/k.json', json_schema_version: 1, audience: 'Student'}}, user: :teacher, response: :forbidden
  test_user_gets_response_for :create, method: :post, params: -> {{key: 'new-unique-video', s3_uri: 's3://b/k.json', json_schema_version: 1, audience: 'Student'}}, user: :levelbuilder, response: :success

  test 'search returns videos matching the query' do
    sign_in create(:levelbuilder)
    create(:json_video, key: 'matching-video')
    create(:json_video, key: 'other-video')

    get :search, params: {query: 'matching', limit: 10}
    assert_response :ok

    results = JSON.parse(response.body)
    assert_equal 1, results.length
    assert_equal 'matching-video', results.first['key']
  end

  test 'search returns empty array for a query shorter than 3 characters' do
    sign_in create(:levelbuilder)
    create(:json_video, key: 'some-video')

    get :search, params: {query: 'so', limit: 10}
    assert_response :ok

    assert_equal [], JSON.parse(response.body)
  end

  test 'create creates a new json video and returns its summary' do
    sign_in create(:levelbuilder)

    post :create, params: {key: 'brand-new-video', s3_uri: 's3://my-bucket/video.json', json_schema_version: 1, audience: 'Student', description: 'A test video'}
    assert_response :ok

    video = JSONVideo.find_by!(key: 'brand-new-video')
    assert_equal 's3://my-bucket/video.json', video.s3_uri
    assert_equal 'A test video', video.description

    data = JSON.parse(response.body)
    assert_equal video.id, data['id']
    assert_equal 'brand-new-video', data['key']
  end

  test 'create returns 400 for an invalid video' do
    sign_in create(:levelbuilder)

    post :create, params: {key: '', s3_uri: '', json_schema_version: nil, audience: ''}
    assert_response :bad_request
  end

  test 'create with jit_pl_exemplar_id immediately associates the video' do
    sign_in create(:levelbuilder)
    concept = create(:jit_pl_concept)
    exemplar = create(:jit_pl_exemplar, jit_pl_concept: concept)

    post :create, params: {
      key: 'exemplar-video',
      s3_uri: 's3://b/v.json',
      json_schema_version: 1,
      audience: 'Student',
      jit_pl_exemplar_id: exemplar.id
    }
    assert_response :ok

    video = JSONVideo.find_by!(key: 'exemplar-video')
    assert_includes exemplar.reload.json_videos, video
  end

  test 'create with jit_pl_misconception_id immediately associates the video' do
    sign_in create(:levelbuilder)
    concept = create(:jit_pl_concept)
    misconception = create(:jit_pl_misconception, jit_pl_concept: concept)

    post :create, params: {
      key: 'misconception-video',
      s3_uri: 's3://b/v.json',
      json_schema_version: 1,
      audience: 'Student',
      jit_pl_misconception_id: misconception.id
    }
    assert_response :ok

    video = JSONVideo.find_by!(key: 'misconception-video')
    assert_includes misconception.reload.json_videos, video
  end

  test 'create with jit_pl_concept_id immediately associates the video' do
    sign_in create(:levelbuilder)
    concept = create(:jit_pl_concept)

    post :create, params: {
      key: 'concept-video',
      s3_uri: 's3://b/v.json',
      json_schema_version: 1,
      audience: 'Student',
      jit_pl_concept_id: concept.id
    }
    assert_response :ok

    video = JSONVideo.find_by!(key: 'concept-video')
    assert_includes concept.reload.json_videos, video
  end

  test 'create associates the video with the lesson objectives' do
    sign_in create(:levelbuilder)
    lesson = create(:lesson)
    objective = create(:objective, lesson: lesson)

    post :create, params: {
      key: 'objective-video',
      s3_uri: 's3://b/v.json',
      json_schema_version: 1,
      audience: 'Student',
      lesson_id: lesson.id,
      objective_ids: [objective.id],
    }
    assert_response :ok

    video = JSONVideo.find_by!(key: 'objective-video')
    assert_includes video.objectives, objective
    assert_equal [objective.id], JSON.parse(response.body)['objectiveIds']
  end

  test 'create uploads the posted file to S3 and derives the s3_uri' do
    sign_in create(:levelbuilder)
    AWS::S3.expects(:upload_to_bucket).with(
      JSONVideosController::SUPPLEMENTAL_BUCKET,
      'json-videos/uploaded-video.json',
      '{"frames":[]}',
      has_entries(no_random: true, content_type: 'application/json')
    ).returns('json-videos/uploaded-video.json')

    post :create, params: {
      key: 'uploaded-video',
      json_schema_version: 1,
      audience: 'Student',
      file: json_upload('{"frames":[]}'),
    }
    assert_response :ok

    video = JSONVideo.find_by!(key: 'uploaded-video')
    assert_equal "s3://#{JSONVideosController::SUPPLEMENTAL_BUCKET}/json-videos/uploaded-video.json", video.s3_uri
  end

  test 'create returns 400 when the uploaded file is not valid JSON' do
    sign_in create(:levelbuilder)
    AWS::S3.expects(:upload_to_bucket).never

    post :create, params: {
      key: 'bad-json-video',
      json_schema_version: 1,
      audience: 'Student',
      file: json_upload('not json'),
    }
    assert_response :bad_request
    assert_nil JSONVideo.find_by(key: 'bad-json-video')
  end

  # update / destroy are levelbuilder-only

  test_user_gets_response_for :update, method: :patch, params: -> {{id: 'test-video', description: 'x'}}, user: :student, response: :forbidden
  test_user_gets_response_for :destroy, method: :delete, params: -> {{id: 'test-video'}}, user: :teacher, response: :forbidden

  test 'update edits fields and returns the lesson-scoped summary' do
    sign_in create(:levelbuilder)
    lesson = create(:lesson)
    objective = create(:objective, lesson: lesson)

    patch :update, params: {
      id: @video.key,
      description: 'updated description',
      audience: 'Teacher',
      lesson_id: lesson.id,
      objective_ids: [objective.id],
    }
    assert_response :ok

    @video.reload
    assert_equal 'updated description', @video.description
    assert_equal 'Teacher', @video.audience
    assert_includes @video.objectives, objective
    assert_equal [objective.id], JSON.parse(response.body)['objectiveIds']
  end

  test 'update preserves objective associations from other lessons' do
    sign_in create(:levelbuilder)
    lesson_a = create(:lesson)
    lesson_b = create(:lesson)
    obj_a = create(:objective, lesson: lesson_a)
    obj_b = create(:objective, lesson: lesson_b)
    @video.objectives = [obj_a, obj_b]

    # Editing from lesson_b, deselecting its objective, must not touch lesson_a.
    # The client sends a lone empty-string marker for an empty selection, since
    # Rails drops a truly empty array param.
    patch :update, params: {
      id: @video.key,
      lesson_id: lesson_b.id,
      objective_ids: [''],
    }
    assert_response :ok

    @video.reload
    assert_includes @video.objectives, obj_a
    refute_includes @video.objectives, obj_b
  end

  test 'update uploads a replacement file when one is posted' do
    sign_in create(:levelbuilder)
    AWS::S3.expects(:upload_to_bucket).with(
      JSONVideosController::SUPPLEMENTAL_BUCKET,
      "json-videos/#{@video.key}.json",
      '{"frames":[1]}',
      has_entries(no_random: true, content_type: 'application/json')
    ).returns("json-videos/#{@video.key}.json")

    patch :update, params: {id: @video.key, file: json_upload('{"frames":[1]}')}
    assert_response :ok

    @video.reload
    assert_equal "s3://#{JSONVideosController::SUPPLEMENTAL_BUCKET}/json-videos/#{@video.key}.json", @video.s3_uri
  end

  test 'update returns 404 for an unknown key' do
    sign_in create(:levelbuilder)
    patch :update, params: {id: 'does-not-exist', description: 'x'}
    assert_response :not_found
  end

  test 'destroy detaches only this lesson objectives when video is used elsewhere' do
    sign_in create(:levelbuilder)
    lesson_a = create(:lesson)
    lesson_b = create(:lesson)
    obj_a = create(:objective, lesson: lesson_a)
    obj_b = create(:objective, lesson: lesson_b)
    @video.objectives = [obj_a, obj_b]

    delete :destroy, params: {id: @video.key, lesson_id: lesson_a.id}
    assert_response :ok

    assert_equal false, JSON.parse(response.body)['deleted']
    @video.reload
    refute_includes @video.objectives, obj_a
    assert_includes @video.objectives, obj_b
  end

  test 'destroy deletes the video entirely once it is orphaned' do
    sign_in create(:levelbuilder)
    lesson = create(:lesson)
    objective = create(:objective, lesson: lesson)
    @video.objectives = [objective]
    AWS::S3.expects(:delete_from_bucket).once

    delete :destroy, params: {id: @video.key, lesson_id: lesson.id}
    assert_response :ok

    assert_equal true, JSON.parse(response.body)['deleted']
    assert_nil JSONVideo.find_by(key: @video.key)
  end

  private def json_upload(contents)
    file = Tempfile.new(['video', '.json'])
    file.write(contents)
    file.rewind
    Rack::Test::UploadedFile.new(file.path, 'application/json')
  end
end
