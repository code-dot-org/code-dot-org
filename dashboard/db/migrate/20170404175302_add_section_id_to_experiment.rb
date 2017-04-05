class AddSectionIdToExperiment < ActiveRecord::Migration[5.0]
  def change
    add_column :experiments, :section_id, :integer
  end
end
