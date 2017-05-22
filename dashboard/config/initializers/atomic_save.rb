# Provides `#atomic_save!` which skips the default transaction
# wrapping behavior of `#save!`.
#
# Only use in cases where validations/callbacks will never
# need to trigger any rollback of the operation.
module ActiveRecord
  module Persistence
    alias_method :atomic_save!, :save!
  end
end
