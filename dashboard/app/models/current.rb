# Current Attributes can be used to store settings used for the duration of an Application Controller request
# (or Active Worker Job).
class Current < ActiveSupport::CurrentAttributes
  # Set this to `true` to enforce all ActiveRecord queries read from the writer database for the current request/job.
  # For example, ensure that curriculum authors (Levelbuilders) always read the changes they just persisted.
  attribute :read_from_writer
end
