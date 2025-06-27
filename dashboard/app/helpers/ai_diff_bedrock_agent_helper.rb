module AiDiffBedrockAgentHelper
  def self.request_agent_chat(input)
    client = Aws::BedrockAgentRuntime::Client.new(stub_responses: false)

    # TODO: Add KB retrieval config (filtering etc.)
    response = client.invoke_agent(
      {
        input_text: input,
        agent_id: 'K2LOE3M6DF',
        # TODO: generate unique session ID per thread
        session_id: 'fnord',
        agent_alias_id: '8FKN2Y39CF',
      }
    )

    response.completion.map do |comp|
      format_response(comp)
    end.join(' ')
  end

  def self.format_response(completion)
    text = completion.bytes

    # Remove useless references such as '(Sources 1 and 7)' from the response
    text.gsub!(/ ?\([Ss]ource[^)]+\)/, '')

    if completion.attribution.present?
      # Gather and append links
      reference_urls = completion.attribution.citations.flat_map do |citation|
        citation.retrieved_references.map do |ref|
          ref.metadata&.[]('url')
        end
      end.sort.uniq

      if reference_urls.any?
        text << "\n\n**See also:**"
        reference_urls.each_with_index do |url, index|
          text << "\n- [Link #{index+1}](#{url})"
        end
      end
    end

    text
  end
end
