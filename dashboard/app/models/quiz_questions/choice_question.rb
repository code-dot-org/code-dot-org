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

    # id and text must both be non-blank, not just Strings - a blank text
    # would render as an answer choice with no visible label.
    unless choices.all? {|c| c.is_a?(Hash) && c['id'].is_a?(String) && c['id'].present? && c['text'].is_a?(String) && c['text'].present?}
      errors.add(:content, 'each choice must have a non-blank "id" and "text"')
      return nil
    end

    choice_ids = choices.map {|c| c['id']}
    unless choice_ids.uniq.length == choice_ids.length
      errors.add(:content, '"choices" ids must be unique')
      return nil
    end

    choice_ids
  end
end
