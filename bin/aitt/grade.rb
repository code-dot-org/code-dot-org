class Grade
  def initialize
  end

  class InvalidResponseError < StandardError
  end

  def grade_student_work(prompt, rubric, student_code, student_id, use_cached: false, examples: [], num_responses:, temperature:)
    if use_cached && File.exist?("cached_responses/#{student_id}.txt")
      cached_response = File.read("cached_responses/#{student_id}.txt")
      tsv_data = parse_tsv(cached_response.strip)
      return tsv_data.map(&:to_h)
    end

    api_url = 'https://api.openai.com/v1/chat/completions'
    headers = {
      'Content-Type' => 'application/json',
      'Authorization' => "Bearer #{ENV['OPENAI_API_KEY']}"
    }

    messages = compute_messages(prompt, rubric, student_code, examples: examples)
    data = {
      model: 'gpt-4',
      temperature: temperature,
      messages: messages,
      n: num_responses,
    }

    start_time = Time.now
    begin
      response = HTTParty.post(api_url, headers: headers, body: data.to_json, timeout: 120)
    rescue Net::ReadTimeout
      puts "#{student_id} request timed out in #{(Time.now - start_time).to_i} seconds."
      return nil
    end

    unless response.code == 200
      puts "#{student_id} Error calling the API: #{response.code}"
      puts "#{student_id} Response body: #{response.body}"
      return nil
    end

    tokens = response.parsed_response['usage']['total_tokens']
    puts "#{student_id} request succeeded in #{(Time.now - start_time).to_i} seconds. #{tokens} tokens used."
    completed_text = response.parsed_response['choices'][0]['message']['content']
    tsv_data = parse_tsv(completed_text.strip)

    begin
      validate_server_response(tsv_data, rubric)
    rescue InvalidResponseError => exception
      puts "#{student_id} Invalid response: #{exception.message}\n#{completed_text}}"
      return nil
    end

    File.write("cached_responses/#{student_id}.txt", completed_text)
    tsv_data.map(&:to_h)
  end

  private

  def parse_tsv(tsv_text)
    rows = tsv_text.split("\n")
    header = rows.shift.split("\t")
    rows.map {|row| Hash[header.zip(row.split("\t"))]}
  end

  def compute_messages(prompt, rubric, student_code, examples: [])
    messages = [
      {role: 'system', content: "#{prompt}\n\nRubric:\n#{rubric}"}
    ]
    examples.each do |example_js, example_rubric|
      messages << {role: 'user', content: example_js}
      messages << {role: 'assistant', content: example_rubric}
    end
    messages << {role: 'user', content: student_code}
  end

  def validate_server_response(tsv_data, rubric)
    expected_columns = ["Key Concept", "Grade", "Reason"]

    # Get the list of key concepts from the rubric
    rubric_key_concepts = CSV.parse(rubric, headers: true).map {|row| row['Key Concept']}.uniq

    # 1. The response represents a table in TSV format
    raise InvalidResponseError.new('invalid format') unless tsv_data.is_a?(Array)

    # 2. The table's column names are "Key Concept", "Grade", and "Reason"
    raise InvalidResponseError.new('incorrect column names') unless tsv_data.all? {|row| (row.keys & expected_columns) == expected_columns}

    # 3. The Key Concept column contains one entry for each Key Concept listed in the rubric
    key_concepts_from_response = tsv_data.map {|row| row["Key Concept"]}.uniq
    raise InvalidResponseError.new('invalid or missing key concept') unless rubric_key_concepts.sort == key_concepts_from_response.sort

    # 4. All entries in the Grade column are one of the valid values
    raise InvalidResponseError.new('invalid grade value') unless tsv_data.all? {|row| VALID_GRADES.include?(row["Grade"])}
  end
end
