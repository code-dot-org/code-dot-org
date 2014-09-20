# Links an Activity to a LevelSourceHint
class ActivityHint < ActiveRecord::Base
  belongs_to :activity
  belongs_to :level_source_hint

  # These are the values for HintRequestPlacement defined in
  # blockly:src/feedback.js as NONE (0), LEFT (1), RIGHT (2).
  VISIBILITY_SHOW_HINT = 0
  VISIBILITY_OFFER_HINT_LEFT = 1   # "show hint" button on left
  VISIBILITY_OFFER_HINT_RIGHT = 2  # "show hint" button on right

  # Amount to add to ActivityHint.hint_visibility to indicate that user requested hint.
  HINT_MADE_VISIBLE_ADJUSTMENT = 3

  def set_made_visible
    value = self.hint_visibility
    if value && value < HINT_MADE_VISIBLE_ADJUSTMENT
      self.update_attribute(:hint_visibility,
                            value + HINT_MADE_VISIBLE_ADJUSTMENT)
    end
  end

  # Returns true, false, or nil (if hint_visibility nil)
  def made_visible?
    if self.hint_visibility
      self.hint_visibility >= HINT_MADE_VISIBLE_ADJUSTMENT
    end
  end
end
