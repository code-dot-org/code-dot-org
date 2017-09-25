module HintsUsed
  extend ActiveSupport::Concern

  included do
    scope :hints_used, ->(user_id, script_id, level_id) {where(user_id: user_id, script_id: script_id, level_id: level_id)}
  end

  class_methods do
    def no_hints_used?(user_id, script_id, level_id)
      hints_used(user_id, script_id, level_id).empty?
    end
  end
end
