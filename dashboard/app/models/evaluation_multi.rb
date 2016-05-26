class EvaluationMulti < Multi
  def dsl_default
    <<ruby
name 'Unique question name here'
question 'Question'
answer 'Answer1', weight: 1, stage_name: 'stage_name'
answer 'Answer2', weight: 1, stage_name: 'stage_name'
ruby
  end
end
