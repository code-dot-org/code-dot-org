json.array!(@plc_evaluation_questions) do |plc_evaluation_question|
  json.extract! plc_evaluation_question, :id
  json.url plc_evaluation_question_url(plc_evaluation_question, format: :json)
end
