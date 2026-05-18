require 'test_helper'

class AiStudentPodcastsHelperTest < ActionView::TestCase
  setup do
    @user = create(:student)
    @lesson = create(:lesson)
    @objective = create(:objective)
    @podcast = AiStudentPodcast.create!(user_id: @user.id, lesson_id: @lesson.id)
    @podcast.ai_student_podcast_objectives.create!(objective_id: @objective.id)

    @openai_api_key = 'test-openai-key'
    @elevenlabs_api_key = 'test-elevenlabs-key'

    CDO.stubs(:openai_lesson_summaries_api_key).returns(@openai_api_key)
    CDO.stubs(:elevenlabs_api_key).returns(@elevenlabs_api_key)
    CDO.stubs(:dashboard_hostname).returns('test.code.org')

    DCDO.stubs(:get).with('openai_http_open_timeout', 5).returns(5)
    DCDO.stubs(:get).with('openai_http_read_timeout', 30).returns(30)
  end

  teardown do
    AiStudentPodcast.where(user_id: @user.id).destroy_all
  end

  # *****
  # generate_podcast_script tests
  # *****

  test "generate_podcast_script saves script to the podcast record and returns it on success" do
    script_array = [
      {'voice_id' => 'Dan', 'text' => 'Hi there.'},
      {'voice_id' => 'Sam', 'text' => 'Hello!'}
    ]
    openai_body = {
      choices: [{message: {content: {script: script_array}.to_json}}]
    }.to_json

    AiSystemPrompts::StudentPodcastPromptHelper.stubs(:get_openai_system_prompt).
      with(@lesson.id, [@objective.id], @user.id).returns('prompt text')

    mock_response = mock('response')
    mock_response.stubs(:code).returns(200)
    mock_response.stubs(:body).returns(openai_body)
    mock_client = mock('client')
    mock_client.expects(:request_podcast_script).with('prompt text').returns(mock_response)
    AiStudentPodcastsHelper::OpenaiClient.expects(:new).returns(mock_client)

    result = AiStudentPodcastsHelper.generate_podcast_script(@podcast)

    assert_equal script_array, JSON.parse(result)
    assert_equal script_array, JSON.parse(@podcast.reload.podcast_script)
  end

  test "generate_podcast_script raises OpenaiStudentPodcastTimeout on read timeout" do
    AiSystemPrompts::StudentPodcastPromptHelper.stubs(:get_openai_system_prompt).returns('prompt')
    mock_client = mock('client')
    mock_client.expects(:request_podcast_script).raises(Net::ReadTimeout)
    AiStudentPodcastsHelper::OpenaiClient.expects(:new).returns(mock_client)

    assert_raises(OpenaiStudentPodcastTimeout) do
      AiStudentPodcastsHelper.generate_podcast_script(@podcast)
    end
  end

  test "generate_podcast_script raises StandardError on non-200 response" do
    AiSystemPrompts::StudentPodcastPromptHelper.stubs(:get_openai_system_prompt).returns('prompt')
    mock_response = mock('response')
    mock_response.stubs(:code).returns(500)
    mock_response.stubs(:body).returns('boom')
    mock_client = mock('client')
    mock_client.expects(:request_podcast_script).returns(mock_response)
    AiStudentPodcastsHelper::OpenaiClient.expects(:new).returns(mock_client)

    error = assert_raises(StandardError) do
      AiStudentPodcastsHelper.generate_podcast_script(@podcast)
    end
    assert_includes error.message, 'status code 500'
  end

  # *****
  # create_and_save_to_s3 tests
  # *****

  test "create_and_save_to_s3 short-circuits without generating script when file already exists in S3" do
    AWS::S3.stubs(:exists_in_bucket).returns(true)
    AWS::S3.expects(:upload_to_bucket).never
    AiStudentPodcastsHelper.expects(:generate_podcast_script).never
    AiStudentPodcastsHelper.expects(:get_podcast_from_script).never

    AiStudentPodcastsHelper.create_and_save_to_s3(@podcast)
  end

  test "create_and_save_to_s3 generates script, fetches mp3, and uploads when S3 file missing" do
    AWS::S3.stubs(:exists_in_bucket).returns(false)
    generated_script = [{voice_id: 'Dan', text: 'hello'}].to_json

    AiStudentPodcastsHelper.expects(:generate_podcast_script).
      with(@podcast).returns(generated_script)
    AiStudentPodcastsHelper.expects(:get_podcast_from_script).
      with(generated_script).returns('mp3-bytes')
    AWS::S3.expects(:upload_to_bucket).with(
      AiStudentPodcastsHelper::PODCAST_BUCKET,
      AiStudentPodcastsHelper.s3_filename(@podcast.id),
      'mp3-bytes',
      no_random: true
    )

    AiStudentPodcastsHelper.create_and_save_to_s3(@podcast)
  end

  # *****
  # retrieve_podcast_from_s3 tests
  # *****

  test "retrieve_podcast_from_s3 delegates to AWS::S3.download_from_bucket" do
    AWS::S3.expects(:download_from_bucket).with(
      AiStudentPodcastsHelper::PODCAST_BUCKET,
      AiStudentPodcastsHelper.s3_filename(42)
    ).returns('mp3-bytes')

    assert_equal 'mp3-bytes', AiStudentPodcastsHelper.retrieve_podcast_from_s3(42)
  end

  # *****
  # resolve_voice_ids tests
  # *****

  test "resolve_voice_ids maps Dan and Sam to their ElevenLabs voice IDs" do
    script = [
      {'voice_id' => 'Dan', 'text' => 'a'},
      {'voice_id' => 'Sam', 'text' => 'b'}
    ].to_json

    result = AiStudentPodcastsHelper.resolve_voice_ids(script)

    assert_equal AiStudentPodcastsHelper::VOICE_ID_DAN, result[0]['voice_id']
    assert_equal AiStudentPodcastsHelper::VOICE_ID_SAM, result[1]['voice_id']
    assert_equal 'a', result[0]['text']
  end

  test "resolve_voice_ids passes through unknown voice_id values unchanged" do
    script = [{'voice_id' => 'Unknown', 'text' => 'x'}].to_json

    result = AiStudentPodcastsHelper.resolve_voice_ids(script)

    assert_equal 'Unknown', result[0]['voice_id']
  end

  # *****
  # get_podcast_from_script tests (ElevenLabs)
  # *****

  test "get_podcast_from_script returns response body on 200" do
    script = [{'voice_id' => 'Dan', 'text' => 'hi'}].to_json
    mock_response = mock('response')
    mock_response.stubs(:code).returns(200)
    mock_response.stubs(:body).returns('mp3-bytes')
    mock_client = mock('client')
    mock_client.expects(:request_podcast).returns(mock_response)
    AiStudentPodcastsHelper::ElevenlabsClient.expects(:new).returns(mock_client)

    assert_equal 'mp3-bytes', AiStudentPodcastsHelper.get_podcast_from_script(script)
  end

  test "get_podcast_from_script raises on non-200 ElevenLabs response" do
    script = [{'voice_id' => 'Dan', 'text' => 'hi'}].to_json
    mock_response = mock('response')
    mock_response.stubs(:code).returns(429)
    mock_response.stubs(:body).returns('rate limited')
    mock_client = mock('client')
    mock_client.expects(:request_podcast).returns(mock_response)
    AiStudentPodcastsHelper::ElevenlabsClient.expects(:new).returns(mock_client)

    error = assert_raises(StandardError) do
      AiStudentPodcastsHelper.get_podcast_from_script(script)
    end
    assert_includes error.message, 'status code 429'
  end

  test "get_podcast_from_script wraps timeouts as StandardError" do
    script = [{'voice_id' => 'Dan', 'text' => 'hi'}].to_json
    mock_client = mock('client')
    mock_client.expects(:request_podcast).raises(Net::OpenTimeout)
    AiStudentPodcastsHelper::ElevenlabsClient.expects(:new).returns(mock_client)

    error = assert_raises(StandardError) do
      AiStudentPodcastsHelper.get_podcast_from_script(script)
    end
    assert_includes error.message, 'Timeout'
  end

  # *****
  # s3_filename tests
  # *****

  test "s3_filename returns folder-prefixed mp3 filename including the podcast id" do
    assert_equal 'student_podcasts/student_podcast_42.mp3',
      AiStudentPodcastsHelper.s3_filename(42)
  end

  # *****
  # ElevenlabsClient tests
  # *****

  test "ElevenlabsClient initialize stores api_key and model" do
    client = AiStudentPodcastsHelper::ElevenlabsClient.new('key', 'model')
    assert_equal 'key', client.api_key
    assert_equal 'model', client.model
  end

  test "ElevenlabsClient request_podcast POSTs JSON to the text-to-dialogue endpoint" do
    prompt = [{voice_id: 'abc', text: 'hi'}]
    expected_headers = {
      "Content-Type" => "application/json",
      "xi-api-key" => @elevenlabs_api_key
    }
    expected_body = {
      model_id: AiStudentPodcastsHelper::ELEVENLABS_MODEL,
      inputs: prompt
    }.to_json

    HTTParty.expects(:post).with(
      AiStudentPodcastsHelper::ElevenlabsClient::ELEVENLABS_URL,
      headers: expected_headers,
      body: expected_body,
      timeout: 180
    ).returns(mock('response'))

    AiStudentPodcastsHelper::ElevenlabsClient.new(@elevenlabs_api_key, AiStudentPodcastsHelper::ELEVENLABS_MODEL).
      request_podcast(prompt)
  end

  # *****
  # OpenaiClient tests
  # *****

  test "OpenaiClient initialize stores api_key and model" do
    client = AiStudentPodcastsHelper::OpenaiClient.new('key', 'model')
    assert_equal 'key', client.api_key
    assert_equal 'model', client.model
  end

  test "OpenaiClient request_podcast_script POSTs to OpenAI chat completions with structured output schema" do
    HTTParty.stubs(:post) do |url, options|
      assert_equal AiStudentPodcastsHelper::OpenaiClient::OPENAI_URL, url
      assert_equal "Bearer #{@openai_api_key}", options[:headers]['Authorization']
      assert_equal 'application/json', options[:headers]['Content-Type']

      body = JSON.parse(options[:body])
      assert_equal AiStudentPodcastsHelper::OPENAI_MODEL, body['model']
      assert_equal 'system', body['messages'].first['role']
      assert_equal 'prompt-here', body['messages'].first['content']

      schema = body['response_format']['json_schema']['schema']
      assert_equal 'object', schema['type']
      assert_equal ['script'], schema['required']
      item_props = schema['properties']['script']['items']['properties']
      assert_equal %w[Dan Sam], item_props['voice_id']['enum']
      assert_equal 'string', item_props['text']['type']

      mock('response')
    end

    AiStudentPodcastsHelper::OpenaiClient.new(@openai_api_key, AiStudentPodcastsHelper::OPENAI_MODEL).
      request_podcast_script('prompt-here')
  end
end
