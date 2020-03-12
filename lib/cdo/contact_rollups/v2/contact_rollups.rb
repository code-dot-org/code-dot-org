class ContactRollupsV2
  def self.build_contact_rollups
    ContactRollupsProcessed.delete_all
    ContactRollupsProcessed.import_from_raw_table
  end
end
