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
    print_lists(text_segment_lists)

    max_toxicity = 0
    max_category = nil
    text_segment_lists.each_with_index do |list, idx|
      comprehend_response = create_comprehend_client.detect_toxic_content(
        {
          text_segments: list.map {|segment| {text: segment}},
          language_code: locale,
        }
      )
      print_comprehend_response(comprehend_response, idx)
      max_toxicity = [max_toxicity, comprehend_response.result_list.map(&:toxicity).max].max
      list_max_category = comprehend_response.result_list.map(&:labels).flatten.max_by(&:score)
      max_category = max_category.nil? ? list_max_category : [max_category, list_max_category].max_by(&:score)
    end

    puts "\nOVERALL RESULTS"
    puts "Max Toxicity: #{max_toxicity.round(3)}"
    puts "Max Category: #{max_category}"
    {
      text: text,
      toxicity: max_toxicity,
      max_category: max_category
    }
  end

  # Returns a collection of text segment lists, each with a list of individual text segments to check for toxicity.
  # Comprehend limits the amount of bytes per segment, and the amount of overall bytes per list.
  def self.get_text_segment_lists(text)
    text_segment_lists = [[""]]
    text.split.each do |word|
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

  def self.print_lists(lists)
    puts "\n\nComputed Segments\n"
    lists.each_with_index do |list, idx|
      size = list.inject(0) {|sum, segment| sum + segment.bytesize}
      puts "List #{idx + 1} (#{list.size} items, #{size} Bytes)"
      list.each_with_index do |segment, idx2|
        puts "\tSegment #{idx2 + 1} (#{segment.bytesize}/#{MAX_SEGMENT_SIZE_BYTES} Bytes): #{segment.truncate(150)}"
      end
    end
  end

  def self.print_comprehend_response(comprehend_response, index)
    list_max = comprehend_response.result_list.map(&:toxicity).max
    list_max_category = comprehend_response.result_list.map(&:labels).flatten.max_by(&:score)
    puts "\n\nResponse for List #{index + 1}. List Max Toxicity: #{list_max.round(3)}. Max Category: #{list_max_category}"
    comprehend_response.result_list.each_with_index do |result, idx|
      puts "Segment #{idx + 1} Toxicity: #{result.toxicity.round(3)}"
      puts "\t#{result.labels.map {|label| label.name + ': ' + label.score.round(3).to_s}.join(', ')}"
      puts "\tMax Category: #{result.labels.max_by(&:score)}"
    end
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
