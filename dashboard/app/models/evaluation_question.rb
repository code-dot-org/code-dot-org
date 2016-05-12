class EvaluationQuestion < Multi
  def dsl_default
    <<ruby
name 'Unique question name here'
question 'Question'
answer 'Answer1', weight, 'learning_module_name'
answer 'Answer2', weight, 'other_learning_module_name'
ruby
  end
end
