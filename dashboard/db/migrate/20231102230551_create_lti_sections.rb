class CreateLtiSections < ActiveRecord::Migration[6.1]
  def change
    create_table :lti_sections do |t|
      t.references :lti_course, index: true, foreign_key: true, null: false, type: :bigint
      t.references :section, index: true, foreign_key: true, null: false, type: :integer
      t.string :lms_section_id, limit: 255

      t.timestamps
    end
  end
end
