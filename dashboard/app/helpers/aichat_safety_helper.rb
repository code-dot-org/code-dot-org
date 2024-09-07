module AichatSafetyHelper
  def check_toxicity_aws_comprehend(message)
    # Define the maximum chunk size in bytes (100KB = 102,400 bytes)
    max_chunk_size = 102_400
    # Convert the message into chunks of max_chunk_size
    message_chunks = []
    current_chunk = ""
    message.bytes.each do |byte|
      if (current_chunk.bytesize + 1) > max_chunk_size
        message_chunks << current_chunk
        current_chunk = ""
      end
      current_chunk << byte.chr
    end
    # Add the last chunk if it's not empty
    message_chunks << current_chunk unless current_chunk.empty?
    # Now, use these chunks in the AWS Comprehend request
    response = aws_comprehend_client.detect_toxic_content(
      {
        text_segments: message_chunks.map {|chunk| {text: chunk}},
        language_code: 'en'
      }
)
    response
  end
  # Tyrone's EC2 instance- TODO update when we have a better long-term solution
  LLMGUARD_URL = "http://ec2-44-223-70-67.compute-1.amazonaws.com:8080/run-script"
  def self.get_llmguard_response(message)
    headers = {
      "Content-Type" => "application/json",
      "Accept" => "application/json"
    }

    data = {
      input_text: message
    }

    HTTParty.post(
      LLMGUARD_URL,
      headers: headers,
      body: data.to_json,
    )
  end

  private def aws_comprehend_client
    Aws::Comprehend::Client.new(region: 'us-east-1') # Adjust the region accordingly
  end
end
