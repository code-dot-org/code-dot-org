require 'test_helper'
require 'webmock/minitest'

class AiLessonSummariesHelperTest < ActionView::TestCase
  include AiLessonSummariesHelper

  setup do
    @lesson = create(:lesson)
    @user = create(:teacher)
    @api_key = 'test-api-key'
    @model = 'gpt-4'

    # Mock CDO constants
    CDO.stubs(:openai_lesson_summary_api_key).returns(@api_key)
    SharedConstants.stubs(:EVALUATE_STUDENT_LEARNING_MODEL_VERSION).returns(@model)

    # Mock DCDO timeouts
    DCDO.stubs(:get).with('openai_http_open_timeout', 5).returns(5)
    DCDO.stubs(:get).with('openai_http_read_timeout', 30).returns(30)

    @successful_openai_response = {
      choices: [{
        message: {
          content: {
            learning_objective: "Students will learn variables",
            lesson_beats: ["Introduction, practice, assessment"],
            misconceptions: ["Variables are boxes"],
            tips: ["Use concrete examples"]
          }.to_json
        }
      }]
    }.to_json

    @system_prompt = "Test system prompt for lesson #{@lesson.id}"

    # Mock the system prompt helper
    AiSystemPrompts::LessonSummariesSystemPromptHelper.stubs(:get_system_prompt).
      with(@lesson.id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:BRIEF_SUMMARY]).returns(@system_prompt)
  end

  # *****
  # get_ai_lesson_summary tests
  # *****

  test "get_ai_lesson_summary returns successful response when API call succeeds" do
    # Mock successful HTTP response
    mock_response = mock('response')
    mock_response.stubs(:code).returns(200)
    mock_response.stubs(:body).returns(@successful_openai_response)

    # Mock the Client class
    mock_client = mock('client')
    mock_client.expects(:request_lesson_summary).with(@system_prompt, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:BRIEF_SUMMARY]).returns(mock_response)
    AiLessonSummariesHelper::Client.expects(:new).returns(mock_client)

    result = AiLessonSummariesHelper.get_ai_lesson_summary(@lesson.id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:BRIEF_SUMMARY])

    expected_content = {
      learning_objective: "Students will learn variables",
      lesson_beats: ["Introduction, practice, assessment"],
      misconceptions: ["Variables are boxes"],
      tips: ["Use concrete examples"]
    }.to_json

    assert_equal 200, result[:status]
    assert_equal expected_content, result[:json]
  end

  test "get_ai_lesson_summary returns error status when API call fails" do
    error_response = {error: "API limit exceeded"}.to_json

    # Mock failed HTTP response
    mock_response = mock('response')
    mock_response.stubs(:code).returns(429)
    mock_response.stubs(:body).returns(error_response)

    # Mock the Client class
    mock_client = mock('client')
    mock_client.expects(:request_lesson_summary).with(@system_prompt, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:BRIEF_SUMMARY]).returns(mock_response)
    AiLessonSummariesHelper::Client.expects(:new).returns(mock_client)

    result = AiLessonSummariesHelper.get_ai_lesson_summary(@lesson.id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:BRIEF_SUMMARY])

    assert_equal 429, result[:status]
    assert_equal error_response, result[:json].to_json
  end

  test "get_ai_lesson_summary gets system prompt from helper" do
    # Mock HTTP response
    mock_response = mock('response')
    mock_response.stubs(:code).returns(200)
    mock_response.stubs(:body).returns(@successful_openai_response)

    # Mock the Client class
    mock_client = mock('client')
    mock_client.expects(:request_lesson_summary).with(@system_prompt, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:BRIEF_SUMMARY]).returns(mock_response)
    AiLessonSummariesHelper::Client.expects(:new).returns(mock_client)

    AiSystemPrompts::LessonSummariesSystemPromptHelper.expects(:get_system_prompt).
      with(@lesson.id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:BRIEF_SUMMARY]).returns(@system_prompt)

    AiLessonSummariesHelper.get_ai_lesson_summary(@lesson.id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:BRIEF_SUMMARY])
  end

  # *****
  # retrieve_and_save_ai_lesson_summary tests
  # *****

  test "retrieve_and_save_ai_lesson_summary creates AiLessonSummary when API call succeeds" do
    # Mock successful API response
    AiLessonSummariesHelper.expects(:get_ai_lesson_summary).with(@lesson.id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:BRIEF_SUMMARY]).
      returns({status: 200, json: "Generated lesson summary"})

    assert_difference 'AiLessonSummary.count', 1 do
      AiLessonSummariesHelper.retrieve_and_save_ai_lesson_summary(@lesson.id, @user.id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:BRIEF_SUMMARY])
    end

    created_summary = AiLessonSummary.last
    assert_equal @user.id, created_summary.user_id
    assert_equal @lesson.id, created_summary.lesson_id
    assert_equal "Generated lesson summary", created_summary.lesson_summary
  end

  test "retrieve_and_save_ai_lesson_summary does not create AiLessonSummary when API call fails" do
    # Mock failed API response
    AiLessonSummariesHelper.expects(:get_ai_lesson_summary).with(@lesson.id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:BRIEF_SUMMARY]).
      returns({status: 500, json: "Internal server error"})

    assert_no_difference 'AiLessonSummary.count' do
      AiLessonSummariesHelper.retrieve_and_save_ai_lesson_summary(@lesson.id, @user.id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:BRIEF_SUMMARY])
    end
  end

  test "Retrieve_and_save creates record with actual API response structure" do
    # Mock the full chain
    mock_response = mock('response')
    mock_response.stubs(:code).returns(200)
    mock_response.stubs(:body).returns(@successful_openai_response)

    HTTParty.stubs(:post).returns(mock_response)

    assert_difference 'AiLessonSummary.count', 1 do
      AiLessonSummariesHelper.retrieve_and_save_ai_lesson_summary(@lesson.id, @user.id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:BRIEF_SUMMARY])
    end

    created_summary = AiLessonSummary.last
    summary_data = JSON.parse(created_summary.lesson_summary)

    assert_equal "Students will learn variables", summary_data['learning_objective']
    assert_equal ["Introduction, practice, assessment"], summary_data['lesson_beats']
    assert_equal ["Variables are boxes"], summary_data['misconceptions']
    assert_equal ["Use concrete examples"], summary_data['tips']
  end

  # *****
  # Client class tests
  # *****

  test "Client initialize sets api_key and model correctly" do
    client = AiLessonSummariesHelper::Client.new(@api_key, @model)

    assert_equal @api_key, client.api_key
    assert_equal @model, client.model
  end

  test "Client request_lesson_summary makes HTTP request with correct parameters for brief summary response format" do
    prompt = "Test prompt for lesson summary"

    expected_headers = {
      "Content-Type" => "application/json",
      "Authorization" => "Bearer #{@api_key}"
    }

    expected_data = {
      model: @model,
      messages: [
        {
          role: "system",
          content: "You are an expert teaching assistant in a computer science classroom who has been asked to summarize the upcoming lesson to help the teacher prepare for class."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "lesson_summary",
          schema: {
            type: "object",
            properties: {
              learning_objective: {type: "string"},
              lesson_beats: {type: "array", items: {type: "string"}},
              misconceptions: {type: "array", items: {type: "string"}},
              tips: {type: "array", items: {type: "string"}}
            }
          }
        }
      }
    }

    # Mock HTTParty.post
    HTTParty.expects(:post).with(
      AiLessonSummariesHelper::Client::OPEN_AI_URL,
      headers: expected_headers,
      body: expected_data.to_json,
      open_timeout: 5,
      read_timeout: 30
    ).returns(mock('response'))

    client = AiLessonSummariesHelper::Client.new(@api_key, @model)
    client.request_lesson_summary(prompt, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:BRIEF_SUMMARY])
  end

  test "Client request_lesson_summary makes HTTP request with correct parameters for podcast transcript response format" do
    prompt = "Test prompt for lesson summary"

    expected_headers = {
      "Content-Type" => "application/json",
      "Authorization" => "Bearer #{@api_key}"
    }

    expected_data = {
      model: @model,
      messages: [
        {
          role: "system",
          content: "You are an expert teaching assistant in a computer science classroom who has been asked to summarize the upcoming lesson to help the teacher prepare for class."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "lesson_summary",
          schema: {
            type: "object",
            properties: {
              transcript: {type: "string"}
            }
          }
        }
      }
    }

    # Mock HTTParty.post
    HTTParty.expects(:post).with(
      AiLessonSummariesHelper::Client::OPEN_AI_URL,
      headers: expected_headers,
      body: expected_data.to_json,
      open_timeout: 5,
      read_timeout: 30
    ).returns(mock('response'))

    client = AiLessonSummariesHelper::Client.new(@api_key, @model)
    client.request_lesson_summary(prompt, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:PODCAST_TRANSCRIPT])
  end

  test "Client request_lesson_summary includes correct JSON schema for brief summary response format" do
    prompt = "Test prompt"

    expected_schema = {
      type: "object",
      properties: {
        learning_objective: {type: "string"},
        lesson_beats: {type: "string"},
        misconceptions: {type: "string"},
        tips: {type: "string"}
      }
    }

    HTTParty.stubs(:post) do |_url, options|
      body_data = JSON.parse(options[:body])
      assert_equal "json_schema", body_data['response_format']['type']
      assert_equal "lesson_summary", body_data['response_format']['json_schema']['name']
      assert_equal expected_schema, body_data['response_format']['json_schema']['schema']
      mock('response')
    end

    client = AiLessonSummariesHelper::Client.new(@api_key, @model)
    client.request_lesson_summary(prompt, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:BRIEF_SUMMARY])
  end

  test "Client request_lesson_summary includes correct JSON schema for podcast transcript response format" do
    prompt = "Test prompt"

    expected_schema = {
      type: "object",
      properties: {
        transcript: {type: "string"}
      }
    }

    HTTParty.stubs(:post) do |_url, options|
      body_data = JSON.parse(options[:body])
      assert_equal "json_schema", body_data['response_format']['type']
      assert_equal "lesson_summary", body_data['response_format']['json_schema']['name']
      assert_equal expected_schema, body_data['response_format']['json_schema']['schema']
      mock('response')
    end

    client = AiLessonSummariesHelper::Client.new(@api_key, @model)
    client.request_lesson_summary(prompt, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:PODCAST_TRANSCRIPT])
  end
end
