class ScholarshipInfoCourseCannotBeNull < ActiveRecord::Migration[5.0]
  def change
    change_column :pd_scholarship_infos, :course, :string, null: false
  end
end
