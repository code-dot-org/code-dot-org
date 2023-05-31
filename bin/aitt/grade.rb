class Grade
  def initialize
  end

  class InvalidResponseError < StandardError
  end

  def grade_student_work(prompt, rubric, student_code, student_id, use_cached: false, examples: [], num_responses:, temperature:)
    if use_cached && File.exist?("cached_responses/#{student_id}.json")
      return JSON.parse(File.read("cached_responses/#{student_id}.json"))
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

    tsv_data_choices = response.parsed_response['choices'].map.with_index do |choice, index|
      completed_text = choice['message']['content']
      get_tsv_data_if_valid(completed_text, rubric, student_id, choice_index: index)
    end.compact

    tsv_data =
      if tsv_data_choices.empty?
        nil
      elsif tsv_data_choices.length == 1
        tsv_data_choices.first
      else
        get_consensus_response(tsv_data_choices, student_id)
      end

    # only write to cache if the response is valid
    File.write("cached_responses/#{student_id}.json", JSON.pretty_generate(tsv_data)) if tsv_data

    tsv_data
  end

  private

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

  # returns an array of hashes representing the AI's assessment, or nil if response_text is invalid.
  def get_tsv_data_if_valid(response_text, rubric, student_id, choice_index: nil)
    tsv_data = parse_tsv(response_text.strip)
    validate_server_response(tsv_data, rubric)
    tsv_data.map(&:to_h)
  rescue InvalidResponseError => exception
    choice_text = choice_index ? "Choice #{choice_index}: " : ''
    puts "#{student_id} #{choice_text} Invalid response: #{exception.message}\n#{response_text}}"
    nil
  end

  def parse_tsv(tsv_text)
    rows = tsv_text.split("\n")
    header = rows.shift.split("\t")
    rows.map {|row| Hash[header.zip(row.split("\t"))]}
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

  # given a preprocessed list of choices returned by the AI, return a single consensus response.
  def get_consensus_response(choices, student_id)
    # create a map from key concept to list of grades
    key_concept_to_grades = {}
    choices.each do |choice|
      choice.each do |row|
        key_concept_to_grades[row['Key Concept']] ||= []
        key_concept_to_grades[row['Key Concept']] << row['Grade']
      end
    end

    # for each key concept, get the majority grade
    key_concept_to_majority_grade = {}
    key_concept_to_grades.each do |key_concept, grades|
      majority_grade = grades.group_by(&:itself).values.max_by(&:size).first
      key_concept_to_majority_grade[key_concept] = majority_grade
      if majority_grade != grades.first
        puts "outvoted #{student_id} Key Concept: #{key_concept.dump} first grade: #{grades.first.dump} majority grade: #{majority_grade.dump}"
      end
    end

    # for each key_concept, obtain the first reason which corresponds to the majority grade
    key_concept_to_reason = {}
    choices.each do |choice|
      choice.each do |row|
        key_concept = row['Key Concept']
        if key_concept_to_majority_grade[key_concept] == row['Grade']
          key_concept_to_reason[key_concept] = row['Reason']
        end
      end
    end

    # construct the final response. if there was a disagreement in votes
    # for any key concept, add the full list of grades to the reason.
    key_concept_to_majority_grade.map do |key_concept, grade|
      grades = key_concept_to_grades[key_concept]
      votes_text = grades.uniq.length == 1 ? '' : "<b>Votes: [#{grades.join(', ')}]</b><br>"
      {
        'Key Concept' => key_concept,
        'Grade' => grade,
        'Reason' => "#{votes_text}#{key_concept_to_reason[key_concept]}"
      }
    end
  end
end
