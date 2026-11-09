# Request- and job-scoped state. Rails' executor resets these attributes between units of work, so a value set by one
# request is never visible to the next one served by the same thread.
class Current < ActiveSupport::CurrentAttributes
  # Set for requests that author curriculum. They read back what they have just written, and a read replica has not
  # necessarily received it yet: see `ReadReplicaHelper`.
  attribute :read_from_writer
end
