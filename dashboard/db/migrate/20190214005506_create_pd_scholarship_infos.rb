class CreatePdScholarshipInfos < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_scholarship_infos do |t|
      t.belongs_to :user, foreign_key: true, null: false, index: true, dependent: :destroy
      t.string :application_year, null: false
      t.string :scholarship_status, null: false
      t.belongs_to :pd_application, foreign_key: true, index: true
      t.belongs_to :pd_enrollment, foreign_key: true, index: true
      t.timestamps
    end
  end
end
