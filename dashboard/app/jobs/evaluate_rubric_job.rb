require 'json'
require 'cdo/pycall'

class EvaluateRubricJob < ApplicationJob
  queue_as :default

  def perform(*args)
    raise 'OPENAI_API_KEY required' unless ENV['OPENAI_API_KEY']

    math = PyCall.import_module('math')
    puts "math.pi = #{math.pi}"
    PyCall.import_module('openai')

    path = File.expand_path('../../../../lib/ai/teaching_assistant/rubric_tester', __FILE__)
    PyCall.sys.path.append(path)
    assess_py = PyCall.import_module("assess")

    lesson = 'CSD-2022-U3-L17'
    code = read_file_from_s3(lesson, 'sample_code/Fz8s.js')
    prompt = read_file_from_s3(lesson, 'system_prompt.txt')
    rubric = read_file_from_s3(lesson, 'standard_rubric.csv')
    api_key = ENV['OPENAI_API_KEY']

    # Get JSON encoded grade
    grade = assess_py.grade(
      code,
      prompt,
      rubric,
      api_key: api_key,
      llm_model: 'gpt-4',
      num_responses: 3,
      temperature: 0.2,
      num_passing_grades: 2
    )

    if grade == -1
      puts 'ERROR.'
    else
      puts 'Completed assessment.'
      puts
      concepts = JSON.parse(grade)
      concepts.each do |concept|
        puts "- #{concept['Key Concept']}"
        puts "  Grade: #{concept['Grade']}"
        puts "  Reason: #{concept['Reason']}"
        puts "  Observations: #{concept['Observations']}"
      end
    end
  end

  private def read_file_from_s3(lesson_name, key_suffix)
    bucket = 'cdo-ai'
    key = "teaching_assistant/lessons/CSD-2022-U3-L17/#{key_suffix}"
    AWS::S3.create_client.get_object(bucket: bucket, key: key)[:body].read
  end
end
