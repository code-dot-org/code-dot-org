require 'cdo/open_ai'
require_relative '../test_helper'

class OpenAITest < Minitest::Test
  def test_generate_image_returns_response_data
    prompt = "Generate an image"
    resolution = "640x480"

    response_data = {"image_url" => "https://example.com/image.png"}

    http_response = Minitest::Mock.new
    http_response.expect(:code, "200")
    http_response.expect(:body, response_data.to_json)

    http = Minitest::Mock.new
    http.expect(:post, http_response, [String, String, Hash])

    Net::HTTP.stub(:new, http) do
      assert_equal response_data, OpenAI.generate_image(prompt, resolution)
    end

    assert_mock http
    assert_mock http_response
  end

  def test_generate_image_raises_exception_on_error
    prompt = "Generate an image"
    resolution = "640x480"

    response_data = {"error" => "API request failed"}

    http_response = Minitest::Mock.new
    http_response.expect(:code, "500")
    http_response.expect(:body, response_data.to_json)

    http = Minitest::Mock.new
    http.expect(:post, http_response, [String, String, Hash])

    Net::HTTP.stub(:new, http) do
      assert_raises(Exception) do
        OpenAI.generate_image(prompt, resolution)
      end
    end

    assert_mock http
    assert_mock http_response
  end

  def test_gpt_returns_message_content
    system_prompt = "System prompt"
    prompt = "User prompt"

    response_data = {
      "choices" => [
        {"message" => {"content" => "Generated response"}}
      ]
    }

    http_response = Minitest::Mock.new
    http_response.expect(:code, "200")
    http_response.expect(:body, response_data.to_json)

    http = Minitest::Mock.new
    http.expect(:post, http_response, [String, String, Hash])

    Net::HTTP.stub(:new, http) do
      assert_equal "Generated response", OpenAI.gpt(system_prompt, prompt)
    end

    assert_mock http
    assert_mock http_response
  end

  def test_gpt_raises_exception_on_error
    system_prompt = "System prompt"
    prompt = "User prompt"

    response_data = {"error" => "API request failed"}

    http_response = Minitest::Mock.new
    http_response.expect(:code, "500")
    http_response.expect(:body, response_data.to_json)

    http = Minitest::Mock.new
    http.expect(:post, http_response, [String, String, Hash])

    Net::HTTP.stub(:new, http) do
      assert_raises(Exception) do
        OpenAI.gpt(system_prompt, prompt)
      end
    end

    assert_mock http
    assert_mock http_response
  end
end
