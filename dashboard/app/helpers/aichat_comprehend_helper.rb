module AichatComprehendHelper
  MAX_SEGMENT_SIZE_BYTES = 1000
  MAX_SEGMENTS_PER_LIST = 10

  def self.create_comprehend_client
    # Stubbed Comprehend allows UI tests (without the roundtrip to the model) to run in CI environments (ie, Drone)
    Rails.application.config.respond_to?(:stub_aichat_aws_services) && Rails.application.config.stub_aichat_aws_services ?
      StubbedComprehendClient.new :
      Aws::Comprehend::Client.new
  end

  # Moderate given text for inappropriate/toxic content using AWS Comprehend client.
  def self.get_toxicity(text, locale)
    return nil if text.blank?

    segments = get_text_segments(text)
    all_results = []
    segments.in_groups_of(MAX_SEGMENTS_PER_LIST, false).each do |segments_group|
      comprehend_response = create_comprehend_client.detect_toxic_content(
        {
          text_segments: segments_group.map {|segment| {text: segment}},
          language_code: locale,
        }
      )
      all_results.concat(comprehend_response.result_list)
    end

    max_toxicity_index = all_results.index(all_results.max_by(&:toxicity))
    flagged_segment = segments[max_toxicity_index]
    max_category = all_results[max_toxicity_index].labels.max_by(&:score)
    {
      flagged_segment: flagged_segment,
      toxicity: all_results[max_toxicity_index].toxicity,
      max_category: {
        name: max_category.name,
        score: max_category.score,
      }
    }
  end

  # Converts a string of text into a list of segments to work with Comprehend's segment limits.
  # Comprehend limits the amount of bytes per segment, and the amount of overall bytes per list.
  def self.get_text_segments(text)
    words = []
    # Split the text by words. If a single word exceeds our segment size limit, split up the word.
    text.split.each do |word|
      if word.bytesize >= MAX_SEGMENT_SIZE_BYTES
        word_segments = [""]
        word.each_char do |char|
          if word_segments.last.bytesize + char.bytesize < MAX_SEGMENT_SIZE_BYTES
            word_segments.last << char
          else
            word_segments << char
          end
        end
        words.concat(word_segments)
      else
        words << word
      end
    end

    segments = [""]
    words.each do |word|
      new_word_size = " #{word}".bytesize
      if segments.last.bytesize + new_word_size >= MAX_SEGMENT_SIZE_BYTES
        # Otherwise, start a new segment in the current list
        segments << ""
      end
      segments.last << (segments.last.empty? ? word : " #{word}")
    end
    segments
  end
end

# Classes that allow us to stub Comprehend in Drone, which does not have permission to access Comprehend.
class StubbedComprehendClient
  def detect_toxic_content(__)
    StubbedComprehendResponse.new
  end
end

class StubbedComprehendResponse
  def initialize(result_list = [StubbedComprehendResult.new])
    @result_list = result_list
  end

  attr_reader :result_list
end

class StubbedComprehendResult
  def initialize(toxicity = 0.1, labels = [StubbedComprehendLabel.new])
    @toxicity = toxicity
    @labels = labels
  end

  attr_reader :toxicity, :labels
end

class StubbedComprehendLabel
  def initialize(name = 'INSULT', score = 0.1)
    @name = name
    @score = score
  end

  attr_reader :name, :score
end
