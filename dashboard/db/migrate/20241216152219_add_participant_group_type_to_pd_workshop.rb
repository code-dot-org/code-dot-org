class AddParticipantGroupTypeToPdWorkshop < ActiveRecord::Migration[6.1]
  def change
    add_column :pd_workshops, :participant_group_type, :string
  end
end
