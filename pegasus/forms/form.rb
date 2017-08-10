# A base class for the `pegasus.forms` table.

class Form
  # @param [Hash] new_data The new data to be saved to the DB.
  # @return [Integer, nil] The form ID to be updated with the upsert, or nil if the upsert should
  #   be an insert.
  def self.update_on_upsert(new_data)
    nil
  end
end
