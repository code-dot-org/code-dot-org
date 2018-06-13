require 'cdo/db'

# A base class for the `pegasus.forms` table.
class Form < Sequel::Model
  include PegasusFormValidation
  # @param [Hash] new_data The new data to be saved to the DB.
  # @return [String, nil] The form secret to be updated with the upsert, or nil if the upsert should
  #   be an insert.
  def self.update_on_upsert(new_data)
    nil
  end
end
