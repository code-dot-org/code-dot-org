class ChangeScholarshipInfoUniqueConstraints < ActiveRecord::Migration[5.0]
  def change
    remove_index "pd_scholarship_infos", name: "index_pd_scholarship_infos_on_user_id_and_application_year"
  end
end
