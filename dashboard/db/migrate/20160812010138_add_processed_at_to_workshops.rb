class AddProcessedAtToWorkshops < ActiveRecord::Migration
  def change
    add_column :pd_workshops, :processed_at, :datetime
  end
end
