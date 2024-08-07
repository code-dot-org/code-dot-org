module AichatSafetyHelper
  # Tyrone's EC2 instance
  LLMGUARD_URL = "http://ec2-44-223-70-67.compute-1.amazonaws.com:8080/run-script"
  def self.get_llmguard_response(message)
    puts
    puts "message in get_llmguard_response: #{message}"
    headers = {
      "Content-Type" => "application/json",
      "Accept" => "application/json"
    }

    data = {
      input_text: message
    }

    HTTParty.get(
      LLMGUARD_URL,
      headers: headers,
      body: data.to_json,
    )
  end
end
