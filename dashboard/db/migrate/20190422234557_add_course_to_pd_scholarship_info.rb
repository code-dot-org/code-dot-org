class AddCourseToPdScholarshipInfo < ActiveRecord::Migration[5.0]
  def change
    add_column :pd_scholarship_infos, :course, :string

    add_index :pd_scholarship_infos, [:user_id, :application_year, :course], unique: true, name: 'index_pd_scholarship_infos_on_user_id_and_app_year_and_course'
  end
end
