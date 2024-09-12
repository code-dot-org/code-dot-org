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
    text_segment_lists = get_text_segment_lists(text)
    max_toxicity = 0
    max_category = nil
    text_segment_lists.each do |list|
      comprehend_response = create_comprehend_client.detect_toxic_content(
        {
          text_segments: list.map {|segment| {text: segment}},
          language_code: locale,
        }
      )
      max_toxicity = [max_toxicity, comprehend_response.result_list.map(&:toxicity).max].max
      list_max_category = comprehend_response.result_list.map(&:labels).flatten.max_by(&:score)
      max_category = max_category.nil? ? list_max_category : [max_category, list_max_category].max_by(&:score)
    end

    {
      text: text,
      toxicity: max_toxicity,
      max_category: max_category
    }
  end

  # Returns a collection of text segment lists, each with a list of individual text segments to check for toxicity.
  # Comprehend limits the amount of bytes per segment, and the amount of overall bytes per list.
  def self.get_text_segment_lists(text)
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

    text_segment_lists = [[""]]
    words.each do |word|
      new_word_size = " #{word}".bytesize
      current_list = text_segment_lists.last
      current_segment = current_list.last

      if current_segment.bytesize + new_word_size >= MAX_SEGMENT_SIZE_BYTES
        if current_list.size >= MAX_SEGMENTS_PER_LIST
          # If we've exceeded the limit for the current list, create a new list
          text_segment_lists << [""]
          current_list = text_segment_lists.last
        else
          # Otherwise, start a new segment in the current list
          current_list << ""
        end
        current_segment = current_list.last
      end

      current_segment << (current_segment.empty? ? word : " #{word}")
    end
    text_segment_lists
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
