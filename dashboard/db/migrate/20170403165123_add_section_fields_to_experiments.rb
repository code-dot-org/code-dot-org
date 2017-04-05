class AddSectionFieldsToExperiments < ActiveRecord::Migration[5.0]
  def change
    add_column :experiments, :percentage, :integer
    add_column :experiments, :earliest_section_start, :datetime
    add_column :experiments, :latest_section_start, :datetime
  end
end
