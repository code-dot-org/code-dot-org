module AichatComprehendHelper
  def self.create_comprehend_client
    # Stubbed Comprehend allows UI tests (without the roundtrip to the model) to run in CI environments (ie, Drone)
    Rails.application.config.respond_to?(:stub_aichat_aws_services) && Rails.application.config.stub_aichat_aws_services ?
      StubbedComprehendClient.new :
      Aws::Comprehend::Client.new
  end

  # Moderate given text for inappropriate/toxic content using AWS Comprehend client.
  def self.get_toxicity(text, locale)
    comprehend_response = create_comprehend_client.detect_toxic_content(
      {
        text_segments: [{text: text}],
        language_code: locale,
      }
    )
    categories = comprehend_response.result_list[0].labels
    {
      text: text,
      toxicity: comprehend_response.result_list[0].toxicity,
      max_category: categories.max_by(&:score),
    }
  end
end

# Classes that allow us to stub Comprehend in Drone, which does not have permission to access Comprehend.
class StubbedComprehendClient
  def detect_toxic_content(__)
    StubbedComprehendResponse.new
  end
end

class StubbedComprehendResponse
  def result_list
    [StubbedComprehendResult.new]
  end
end

class StubbedComprehendResult
  def toxicity
    0.1
  end

  def labels
    [StubbedComprehendLabel.new]
  end
end

class StubbedComprehendLabel
  def name
    'INSULT'
  end

  def score
    0.1
  end
end
