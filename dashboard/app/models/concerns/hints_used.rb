module HintsUsed
  extend ActiveSupport::Concern

  included do
    scope :hints_used, ->(user_id, script_id, level_id) { where(user_id: user_id, script_id: script_id, level_id: level_id) }
  end
end
