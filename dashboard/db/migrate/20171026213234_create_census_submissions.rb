class CreateCensusSubmissions < ActiveRecord::Migration[5.0]
  def change
    create_table :census_submissions do |t|
      t.string :type, null: false
      t.string :submitter_email_address
      t.string :submitter_name
      t.string :submitter_role
      t.integer :school_year, limit: 4, null: false
      t.string :how_many_do_hoc
      t.string :how_many_after_school
      t.string :how_many_10_hours
      t.string :how_many_20_hours
      t.boolean :other_classes_under_20_hours
      t.boolean :topic_blocks
      t.boolean :topic_text
      t.boolean :topic_robots
      t.boolean :topic_internet
      t.boolean :topic_security
      t.boolean :topic_data
      t.boolean :topic_web_design
      t.boolean :topic_game_design
      t.boolean :topic_other
      t.string :topic_other_description
      t.boolean :topic_do_not_know
      t.string :class_frequency
      t.string :tell_us_more
      t.boolean :pledged

      t.timestamps
    end

    add_index :census_submissions, [:school_year, :id]

    create_join_table :census_submissions, :school_infos do |t|
      t.index [:census_submission_id, :school_info_id], name: 'census_submission_school_info_id', unique: true
      t.index [:school_info_id, :census_submission_id], name: 'school_info_id_census_submission', unique: true
      t.timestamps
    end
  end
end
