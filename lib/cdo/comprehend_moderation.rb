module ComprehendModeration
  self.create_comprehend_client
    Aws::Comprehend::Client.new
  end

  self.get_toxicity_threshold
    DCDO.get("aws_comprehend_toxicity_threshold", 0.25)
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
