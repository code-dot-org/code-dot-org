class AddStandardTypeToLessonsStandards < ActiveRecord::Migration[5.2]
  def change
    add_column :stages_standards, :standard_type, :string
  end
end
