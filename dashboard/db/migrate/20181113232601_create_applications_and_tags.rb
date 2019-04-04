class CreateApplicationsAndTags < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_application_tags_applications, id: false do |t|
      t.belongs_to :pd_application, null: false, foreign_key: true, index: true, dependent: :destroy
      t.belongs_to :pd_application_tag, null: false, foreign_key: true, index: true
      t.timestamps
    end
  end
end
