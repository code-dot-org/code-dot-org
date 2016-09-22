class AddProcessedAtToWorkshops < ActiveRecord::Migration[4.2]
  def change
    add_column :pd_workshops, :processed_at, :datetime
  end
end
