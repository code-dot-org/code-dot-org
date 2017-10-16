class AddCourseToPdApplications < ActiveRecord::Migration[5.0]
  def change
    add_column :pd_applications, :course, :string
    add_index :pd_applications, :course
  end
end
