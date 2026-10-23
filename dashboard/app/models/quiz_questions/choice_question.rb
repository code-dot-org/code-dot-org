# Shared by question types whose `content` includes a "choices" array.
module ChoiceQuestion
  extend ActiveSupport::Concern

  # Returns the set of choice ids, or nil (after recording an error on
  # `content`) if the shape is invalid.
  protected def validate_choices(choices)
    unless choices.is_a?(Array) && choices.length >= 2
      errors.add(:content, 'must have at least 2 "choices"')
      return nil
    end

    validate_items(choices, 'choice')
  end
end
