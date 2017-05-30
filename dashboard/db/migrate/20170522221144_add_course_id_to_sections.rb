class AddCourseIdToSections < ActiveRecord::Migration[5.0]
  def change
    change_table :sections do |t|
      t.belongs_to :course, after: :script_id, foreign_key: true, index: false
    end
  end
end
