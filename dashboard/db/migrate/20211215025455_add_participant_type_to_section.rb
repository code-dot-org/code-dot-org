class AddParticipantTypeToSection < ActiveRecord::Migration[5.2]
  def change
    add_column :sections, :participant_type, :string, null: false, default: 'student'
  end
end
