# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20180202225407) do

  create_table "activities", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "user_id"
    t.integer  "level_id"
    t.string   "action"
    t.string   "url"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "attempt"
    t.integer  "time"
    t.integer  "test_result"
    t.integer  "level_source_id"
    t.integer  "lines",           default: 0, null: false
    t.index ["level_source_id"], name: "index_activities_on_level_source_id", using: :btree
    t.index ["user_id", "level_id"], name: "index_activities_on_user_id_and_level_id", using: :btree
  end

  create_table "ap_cs_offerings", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "school_code", limit: 6, null: false
    t.string   "course",      limit: 3, null: false
    t.integer  "school_year", limit: 2, null: false
    t.datetime "created_at",            null: false
    t.datetime "updated_at",            null: false
    t.index ["school_code", "school_year", "course"], name: "index_ap_cs_offerings_on_school_code_and_school_year_and_course", unique: true, using: :btree
  end

  create_table "ap_school_codes", id: false, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "school_code", limit: 6,  null: false
    t.string   "school_id",   limit: 12, null: false
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
    t.index ["school_code"], name: "index_ap_school_codes_on_school_code", unique: true, using: :btree
    t.index ["school_id"], name: "index_ap_school_codes_on_school_id", unique: true, using: :btree
  end

  create_table "authored_hint_view_requests", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "user_id",               null: false
    t.integer  "script_id"
    t.integer  "level_id"
    t.string   "hint_id"
    t.string   "hint_class"
    t.string   "hint_type"
    t.integer  "prev_time"
    t.integer  "prev_attempt"
    t.integer  "prev_test_result"
    t.integer  "prev_level_source_id"
    t.integer  "next_time"
    t.integer  "next_attempt"
    t.integer  "next_test_result"
    t.integer  "next_level_source_id"
    t.integer  "final_time"
    t.integer  "final_attempt"
    t.integer  "final_test_result"
    t.integer  "final_level_source_id"
    t.datetime "created_at",            null: false
    t.datetime "updated_at",            null: false
    t.index ["level_id"], name: "fk_rails_8f51960e09", using: :btree
    t.index ["script_id", "level_id"], name: "index_authored_hint_view_requests_on_script_id_and_level_id", using: :btree
    t.index ["user_id", "script_id", "level_id", "hint_id"], name: "index_authored_hint_view_requests_on_all_related_ids", using: :btree
  end

  create_table "callouts", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "element_id",       limit: 1024,  null: false
    t.string   "localization_key", limit: 1024,  null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "script_level_id"
    t.text     "qtip_config",      limit: 65535
    t.string   "on"
    t.string   "callout_text"
  end

  create_table "census_submission_form_maps", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "census_submission_id", null: false
    t.integer  "form_id",              null: false
    t.datetime "created_at",           null: false
    t.datetime "updated_at",           null: false
    t.index ["census_submission_id"], name: "index_census_submission_form_maps_on_census_submission_id", using: :btree
    t.index ["form_id"], name: "index_census_submission_form_maps_on_form_id", using: :btree
  end

  create_table "census_submissions", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "type",                                       null: false
    t.string   "submitter_email_address"
    t.string   "submitter_name"
    t.string   "submitter_role"
    t.integer  "school_year",                                null: false
    t.string   "how_many_do_hoc"
    t.string   "how_many_after_school"
    t.string   "how_many_10_hours"
    t.string   "how_many_20_hours"
    t.boolean  "other_classes_under_20_hours"
    t.boolean  "topic_blocks"
    t.boolean  "topic_text"
    t.boolean  "topic_robots"
    t.boolean  "topic_internet"
    t.boolean  "topic_security"
    t.boolean  "topic_data"
    t.boolean  "topic_web_design"
    t.boolean  "topic_game_design"
    t.boolean  "topic_other"
    t.string   "topic_other_description"
    t.boolean  "topic_do_not_know"
    t.string   "class_frequency"
    t.text     "tell_us_more",                 limit: 65535
    t.boolean  "pledged"
    t.datetime "created_at",                                 null: false
    t.datetime "updated_at",                                 null: false
    t.boolean  "share_with_regional_partners"
    t.index ["school_year", "id"], name: "index_census_submissions_on_school_year_and_id", using: :btree
  end

  create_table "census_submissions_school_infos", id: false, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "census_submission_id", null: false
    t.integer  "school_info_id",       null: false
    t.datetime "created_at",           null: false
    t.datetime "updated_at",           null: false
    t.index ["census_submission_id", "school_info_id"], name: "census_submission_school_info_id", unique: true, using: :btree
    t.index ["school_info_id", "census_submission_id"], name: "school_info_id_census_submission", unique: true, using: :btree
  end

  create_table "census_summaries", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "school_id",   limit: 12,    null: false
    t.integer  "school_year", limit: 2,     null: false
    t.string   "teaches_cs",  limit: 1
    t.text     "audit_data",  limit: 65535, null: false
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
    t.index ["school_id", "school_year"], name: "index_census_summaries_on_school_id_and_school_year", unique: true, using: :btree
  end

  create_table "channel_tokens", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "storage_app_id", null: false
    t.integer  "level_id",       null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "storage_id",     null: false
    t.index ["storage_app_id"], name: "index_channel_tokens_on_storage_app_id", using: :btree
    t.index ["storage_id", "level_id"], name: "index_channel_tokens_on_storage_id_and_level_id", unique: true, using: :btree
    t.index ["storage_id"], name: "index_channel_tokens_on_storage_id", using: :btree
  end

  create_table "circuit_playground_discount_applications", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "user_id",                                             null: false
    t.integer  "unit_6_intention"
    t.boolean  "full_discount"
    t.boolean  "admin_set_status",                    default: false, null: false
    t.string   "signature"
    t.datetime "signed_at"
    t.integer  "circuit_playground_discount_code_id"
    t.datetime "created_at",                                          null: false
    t.datetime "updated_at",                                          null: false
    t.string   "school_id"
    t.index ["circuit_playground_discount_code_id"], name: "index_circuit_playground_applications_on_code_id", using: :btree
    t.index ["school_id"], name: "index_circuit_playground_discount_applications_on_school_id", using: :btree
    t.index ["user_id"], name: "index_circuit_playground_discount_applications_on_user_id", unique: true, using: :btree
  end

  create_table "circuit_playground_discount_codes", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "code",          null: false
    t.boolean  "full_discount", null: false
    t.datetime "expiration",    null: false
    t.datetime "claimed_at"
    t.datetime "voided_at"
    t.datetime "created_at",    null: false
    t.datetime "updated_at",    null: false
  end

  create_table "cohorts", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "name"
    t.string   "program_type"
    t.datetime "cutoff_date"
    t.integer  "script_id"
    t.index ["name"], name: "index_cohorts_on_name", using: :btree
    t.index ["program_type"], name: "index_cohorts_on_program_type", using: :btree
  end

  create_table "cohorts_deleted_users", id: false, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer "user_id",   null: false
    t.integer "cohort_id", null: false
    t.index ["cohort_id", "user_id"], name: "index_cohorts_deleted_users_on_cohort_id_and_user_id", using: :btree
    t.index ["user_id", "cohort_id"], name: "index_cohorts_deleted_users_on_user_id_and_cohort_id", using: :btree
  end

  create_table "cohorts_districts", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer "cohort_id",    null: false
    t.integer "district_id",  null: false
    t.integer "max_teachers"
    t.index ["cohort_id", "district_id"], name: "index_cohorts_districts_on_cohort_id_and_district_id", using: :btree
    t.index ["district_id", "cohort_id"], name: "index_cohorts_districts_on_district_id_and_cohort_id", using: :btree
  end

  create_table "cohorts_users", id: false, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer "user_id",   null: false
    t.integer "cohort_id", null: false
    t.index ["cohort_id", "user_id"], name: "index_cohorts_users_on_cohort_id_and_user_id", using: :btree
    t.index ["user_id", "cohort_id"], name: "index_cohorts_users_on_user_id_and_cohort_id", using: :btree
  end

  create_table "concepts", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "video_id"
    t.index ["video_id"], name: "index_concepts_on_video_id", using: :btree
  end

  create_table "concepts_levels", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer "concept_id"
    t.integer "level_id"
    t.index ["concept_id"], name: "index_concepts_levels_on_concept_id", using: :btree
    t.index ["level_id"], name: "index_concepts_levels_on_level_id", using: :btree
  end

  create_table "contained_level_answers", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
    t.integer  "level_id",                    null: false
    t.integer  "answer_number",               null: false
    t.text     "answer_text",   limit: 65535
    t.boolean  "correct"
    t.index ["level_id"], name: "index_contained_level_answers_on_level_id", using: :btree
  end

  create_table "contained_levels", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.datetime "created_at",                             null: false
    t.datetime "updated_at",                             null: false
    t.integer  "level_group_level_id",                   null: false
    t.integer  "contained_level_id",                     null: false
    t.string   "contained_level_type",                   null: false
    t.integer  "contained_level_page",                   null: false
    t.integer  "contained_level_position",               null: false
    t.text     "contained_level_text",     limit: 65535
    t.index ["contained_level_id"], name: "index_contained_levels_on_contained_level_id", using: :btree
    t.index ["level_group_level_id"], name: "index_contained_levels_on_level_group_level_id", using: :btree
  end

  create_table "course_scripts", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer "course_id",         null: false
    t.integer "script_id",         null: false
    t.integer "position",          null: false
    t.string  "experiment_name",                comment: "If present, the SingleTeacherExperiment with this name must be enabled in order for a teacher or their students to see this script."
    t.integer "default_script_id",              comment: "If present, indicates the default script which this script will replace when the corresponding experiment is enabled. Should be null for default scripts (those that show up without experiments)."
    t.index ["course_id"], name: "index_course_scripts_on_course_id", using: :btree
    t.index ["default_script_id"], name: "index_course_scripts_on_default_script_id", using: :btree
    t.index ["script_id"], name: "index_course_scripts_on_script_id", using: :btree
  end

  create_table "courses", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "name"
    t.text     "properties", limit: 65535
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
    t.index ["name"], name: "index_courses_on_name", using: :btree
  end

  create_table "districts", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "name",       null: false
    t.string   "location"
    t.integer  "contact_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["contact_id"], name: "index_districts_on_contact_id", using: :btree
    t.index ["name"], name: "index_districts_on_name", using: :btree
  end

  create_table "districts_users", id: false, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer "user_id",     null: false
    t.integer "district_id", null: false
    t.index ["district_id", "user_id"], name: "index_districts_users_on_district_id_and_user_id", using: :btree
    t.index ["user_id", "district_id"], name: "index_districts_users_on_user_id_and_district_id", using: :btree
  end

  create_table "experiments", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.datetime "created_at",           null: false
    t.datetime "updated_at",           null: false
    t.string   "name",                 null: false
    t.string   "type",                 null: false
    t.datetime "start_at"
    t.datetime "end_at"
    t.integer  "section_id"
    t.integer  "min_user_id"
    t.integer  "max_user_id"
    t.integer  "overflow_max_user_id"
    t.datetime "earliest_section_at"
    t.datetime "latest_section_at"
    t.integer  "script_id"
    t.index ["max_user_id"], name: "index_experiments_on_max_user_id", using: :btree
    t.index ["min_user_id"], name: "index_experiments_on_min_user_id", using: :btree
    t.index ["overflow_max_user_id"], name: "index_experiments_on_overflow_max_user_id", using: :btree
    t.index ["section_id"], name: "index_experiments_on_section_id", using: :btree
  end

  create_table "facilitators_workshops", id: false, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer "workshop_id",    null: false
    t.integer "facilitator_id", null: false
  end

  create_table "featured_projects", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "storage_app_id"
    t.datetime "featured_at"
    t.datetime "unfeatured_at"
    t.index ["storage_app_id"], name: "index_featured_projects_on_storage_app_id", unique: true, using: :btree
  end

  create_table "followers", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "student_user_id", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "section_id"
    t.datetime "deleted_at"
    t.index ["section_id", "student_user_id"], name: "index_followers_on_section_id_and_student_user_id", using: :btree
    t.index ["student_user_id"], name: "index_followers_on_student_user_id", using: :btree
  end

  create_table "gallery_activities", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "user_id",                            null: false
    t.integer  "user_level_id"
    t.integer  "level_source_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "autosaved"
    t.string   "app",             default: "turtle", null: false
    t.index ["app", "autosaved"], name: "index_gallery_activities_on_app_and_autosaved", using: :btree
    t.index ["level_source_id"], name: "index_gallery_activities_on_level_source_id", using: :btree
    t.index ["user_id", "level_source_id"], name: "index_gallery_activities_on_user_id_and_level_source_id", using: :btree
    t.index ["user_level_id"], name: "index_gallery_activities_on_user_level_id", using: :btree
  end

  create_table "games", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "app"
    t.integer  "intro_video_id"
    t.index ["intro_video_id"], name: "index_games_on_intro_video_id", using: :btree
  end

  create_table "hint_view_requests", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "user_id"
    t.integer  "script_id"
    t.integer  "level_id"
    t.integer  "feedback_type"
    t.text     "feedback_xml",  limit: 65535
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
    t.index ["script_id", "level_id"], name: "index_hint_view_requests_on_script_id_and_level_id", using: :btree
    t.index ["user_id"], name: "index_hint_view_requests_on_user_id", using: :btree
  end

  create_table "ib_cs_offerings", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "school_code", limit: 6, null: false
    t.string   "level",       limit: 2, null: false
    t.integer  "school_year", limit: 2, null: false
    t.datetime "created_at",            null: false
    t.datetime "updated_at",            null: false
    t.index ["school_code", "school_year", "level"], name: "index_ib_cs_offerings_on_school_code_and_school_year_and_level", unique: true, using: :btree
  end

  create_table "ib_school_codes", id: false, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "school_code", limit: 6,  null: false
    t.string   "school_id",   limit: 12, null: false
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
    t.index ["school_code"], name: "index_ib_school_codes_on_school_code", unique: true, using: :btree
    t.index ["school_id"], name: "index_ib_school_codes_on_school_id", unique: true, using: :btree
  end

  create_table "level_concept_difficulties", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "level_id"
    t.datetime "created_at",            null: false
    t.datetime "updated_at",            null: false
    t.integer  "sequencing"
    t.integer  "debugging"
    t.integer  "repeat_loops"
    t.integer  "repeat_until_while"
    t.integer  "for_loops"
    t.integer  "events"
    t.integer  "variables"
    t.integer  "functions"
    t.integer  "functions_with_params"
    t.integer  "conditionals"
    t.index ["level_id"], name: "index_level_concept_difficulties_on_level_id", using: :btree
  end

  create_table "level_source_images", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "level_source_id"
    t.binary   "image",           limit: 16777215
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["level_source_id"], name: "index_level_source_images_on_level_source_id", using: :btree
  end

  create_table "level_sources", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "level_id"
    t.string   "md5",        limit: 32,                    null: false
    t.string   "data",       limit: 20000,                 null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "hidden",                   default: false
    t.index ["level_id", "md5"], name: "index_level_sources_on_level_id_and_md5", using: :btree
  end

  create_table "level_sources_multi_types", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer "level_source_id",               null: false
    t.integer "level_id",                      null: false
    t.text    "data",            limit: 65535
    t.string  "md5",                           null: false
    t.boolean "hidden"
    t.index ["level_id"], name: "index_level_sources_multi_types_on_level_id", using: :btree
    t.index ["level_source_id"], name: "index_level_sources_multi_types_on_level_source_id", using: :btree
  end

  create_table "levels", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "game_id"
    t.string   "name",                                                null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "level_num"
    t.integer  "ideal_level_source_id"
    t.integer  "user_id"
    t.text     "properties",            limit: 65535
    t.string   "type"
    t.string   "md5"
    t.boolean  "published",                           default: false, null: false
    t.text     "notes",                 limit: 65535
    t.text     "audit_log",             limit: 65535
    t.index ["game_id"], name: "index_levels_on_game_id", using: :btree
    t.index ["name"], name: "index_levels_on_name", using: :btree
  end

  create_table "levels_script_levels", id: false, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer "level_id",        null: false
    t.integer "script_level_id", null: false
    t.index ["level_id"], name: "index_levels_script_levels_on_level_id", using: :btree
    t.index ["script_level_id"], name: "index_levels_script_levels_on_script_level_id", using: :btree
  end

  create_table "metrics", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
    t.date     "computed_on",            null: false
    t.string   "computed_by",            null: false
    t.date     "metric_on",              null: false
    t.string   "course"
    t.string   "breakdown"
    t.string   "metric",                 null: false
    t.string   "submetric",              null: false
    t.float    "value",       limit: 24, null: false
  end

  create_table "paired_user_levels", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "driver_user_level_id"
    t.integer  "navigator_user_level_id"
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
    t.index ["driver_user_level_id"], name: "index_paired_user_levels_on_driver_user_level_id", using: :btree
    t.index ["navigator_user_level_id"], name: "index_paired_user_levels_on_navigator_user_level_id", using: :btree
  end

  create_table "pd_accepted_programs", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
    t.string   "workshop_name",          null: false
    t.string   "course",                 null: false
    t.integer  "user_id",                null: false
    t.integer  "teacher_application_id"
  end

  create_table "pd_applications", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "user_id"
    t.string   "type",                                              null: false
    t.string   "application_year",                                  null: false
    t.string   "application_type",                                  null: false
    t.integer  "regional_partner_id"
    t.string   "status"
    t.datetime "locked_at"
    t.text     "notes",                               limit: 65535
    t.text     "form_data",                           limit: 65535, null: false
    t.datetime "created_at",                                        null: false
    t.datetime "updated_at",                                        null: false
    t.string   "course"
    t.text     "response_scores",                     limit: 65535,              comment: "Scores given to certain responses"
    t.string   "application_guid"
    t.datetime "decision_notification_email_sent_at"
    t.datetime "accepted_at"
    t.text     "properties",                          limit: 65535
    t.index ["application_guid"], name: "index_pd_applications_on_application_guid", using: :btree
    t.index ["application_type"], name: "index_pd_applications_on_application_type", using: :btree
    t.index ["application_year"], name: "index_pd_applications_on_application_year", using: :btree
    t.index ["course"], name: "index_pd_applications_on_course", using: :btree
    t.index ["regional_partner_id"], name: "index_pd_applications_on_regional_partner_id", using: :btree
    t.index ["status"], name: "index_pd_applications_on_status", using: :btree
    t.index ["type"], name: "index_pd_applications_on_type", using: :btree
    t.index ["user_id"], name: "index_pd_applications_on_user_id", using: :btree
  end

  create_table "pd_attendances", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "pd_session_id",     null: false
    t.integer  "teacher_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.datetime "deleted_at"
    t.integer  "pd_enrollment_id"
    t.integer  "marked_by_user_id",              comment: "User id for the partner or admin who marked this teacher in attendance, or nil if the teacher self-attended."
    t.index ["pd_enrollment_id"], name: "index_pd_attendances_on_pd_enrollment_id", using: :btree
    t.index ["pd_session_id", "teacher_id"], name: "index_pd_attendances_on_pd_session_id_and_teacher_id", unique: true, using: :btree
  end

  create_table "pd_course_facilitators", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer "facilitator_id", null: false
    t.string  "course",         null: false
    t.index ["course"], name: "index_pd_course_facilitators_on_course", using: :btree
  end

  create_table "pd_district_payment_terms", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer "school_district_id"
    t.string  "course",                                     null: false
    t.string  "rate_type",                                  null: false
    t.decimal "rate",               precision: 8, scale: 2, null: false
    t.index ["school_district_id", "course"], name: "index_pd_district_payment_terms_school_district_course", using: :btree
  end

  create_table "pd_enrollment_notifications", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.datetime "created_at",       null: false
    t.datetime "updated_at",       null: false
    t.integer  "pd_enrollment_id", null: false
    t.string   "name"
    t.index ["pd_enrollment_id"], name: "index_pd_enrollment_notifications_on_pd_enrollment_id", using: :btree
  end

  create_table "pd_enrollments", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "pd_workshop_id",      null: false
    t.string   "name"
    t.string   "first_name"
    t.string   "last_name"
    t.string   "email",               null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "school"
    t.string   "code"
    t.integer  "user_id"
    t.datetime "survey_sent_at"
    t.integer  "completed_survey_id"
    t.integer  "school_info_id"
    t.datetime "deleted_at"
    t.index ["code"], name: "index_pd_enrollments_on_code", unique: true, using: :btree
    t.index ["email"], name: "index_pd_enrollments_on_email", using: :btree
    t.index ["pd_workshop_id"], name: "index_pd_enrollments_on_pd_workshop_id", using: :btree
  end

  create_table "pd_facilitator_program_registrations", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "user_id",                  null: false
    t.text     "form_data",  limit: 65535
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
    t.integer  "teachercon"
    t.index ["user_id", "teachercon"], name: "index_pd_fac_prog_reg_on_user_id_and_teachercon", unique: true, using: :btree
  end

  create_table "pd_facilitator_teachercon_attendances", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer "user_id",     null: false
    t.date    "tc1_arrive"
    t.date    "tc1_depart"
    t.date    "fit1_arrive"
    t.date    "fit1_depart"
    t.string  "fit1_course"
    t.date    "tc2_arrive"
    t.date    "tc2_depart"
    t.date    "fit2_arrive"
    t.date    "fit2_depart"
    t.string  "fit2_course"
    t.date    "tc3_arrive"
    t.date    "tc3_depart"
    t.date    "fit3_arrive"
    t.date    "fit3_depart"
    t.string  "fit3_course"
    t.index ["user_id"], name: "index_pd_facilitator_teachercon_attendances_on_user_id", using: :btree
  end

  create_table "pd_fit_weekend1819_registrations", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "pd_application_id"
    t.text     "form_data",         limit: 65535
    t.datetime "created_at",                      null: false
    t.datetime "updated_at",                      null: false
    t.index ["pd_application_id"], name: "index_pd_fit_weekend1819_registrations_on_pd_application_id", using: :btree
  end

  create_table "pd_payment_terms", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "regional_partner_id",               null: false
    t.date     "start_date",                        null: false
    t.date     "end_date"
    t.string   "course"
    t.string   "subject"
    t.text     "properties",          limit: 65535
    t.datetime "created_at",                        null: false
    t.datetime "updated_at",                        null: false
    t.index ["regional_partner_id"], name: "index_pd_payment_terms_on_regional_partner_id", using: :btree
  end

  create_table "pd_pre_workshop_surveys", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "pd_enrollment_id",               null: false
    t.text     "form_data",        limit: 65535, null: false
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
    t.index ["pd_enrollment_id"], name: "index_pd_pre_workshop_surveys_on_pd_enrollment_id", unique: true, using: :btree
  end

  create_table "pd_regional_partner_cohorts", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "regional_partner_id"
    t.integer  "role",                             comment: "teacher or facilitator"
    t.string   "year",                             comment: "free-form text year range, YYYY-YYYY, e.g. 2016-2017"
    t.string   "course",              null: false
    t.string   "name",                             comment: "Human readable name of cohort (not required, used to support large partners with multiple cohorts)"
    t.integer  "size",                             comment: "Number of people permitted in the cohort"
    t.integer  "summer_workshop_id"
    t.datetime "created_at",          null: false
    t.datetime "updated_at",          null: false
    t.index ["regional_partner_id"], name: "index_pd_regional_partner_cohorts_on_regional_partner_id", using: :btree
    t.index ["summer_workshop_id"], name: "index_pd_regional_partner_cohorts_on_summer_workshop_id", using: :btree
  end

  create_table "pd_regional_partner_cohorts_users", id: false, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer "pd_regional_partner_cohort_id", null: false
    t.integer "user_id",                       null: false
    t.index ["pd_regional_partner_cohort_id"], name: "index_pd_regional_partner_cohorts_users_on_cohort_id", using: :btree
    t.index ["user_id"], name: "index_pd_regional_partner_cohorts_users_on_user_id", using: :btree
  end

  create_table "pd_regional_partner_contacts", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "user_id"
    t.integer  "regional_partner_id"
    t.text     "form_data",           limit: 65535
    t.datetime "created_at",                        null: false
    t.datetime "updated_at",                        null: false
    t.index ["regional_partner_id"], name: "index_pd_regional_partner_contacts_on_regional_partner_id", using: :btree
    t.index ["user_id"], name: "index_pd_regional_partner_contacts_on_user_id", using: :btree
  end

  create_table "pd_regional_partner_mappings", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "regional_partner_id", null: false
    t.string   "state"
    t.string   "zip_code"
    t.datetime "created_at",          null: false
    t.datetime "updated_at",          null: false
    t.index ["regional_partner_id", "state", "zip_code"], name: "index_pd_regional_partner_mappings_on_id_and_state_and_zip_code", unique: true, using: :btree
    t.index ["regional_partner_id"], name: "index_pd_regional_partner_mappings_on_regional_partner_id", using: :btree
  end

  create_table "pd_regional_partner_program_registrations", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "user_id",                  null: false
    t.text     "form_data",  limit: 65535
    t.integer  "teachercon",               null: false
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
    t.index ["user_id", "teachercon"], name: "index_pd_reg_part_prog_reg_on_user_id_and_teachercon", using: :btree
  end

  create_table "pd_sessions", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "pd_workshop_id"
    t.datetime "start",          null: false
    t.datetime "end",            null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.datetime "deleted_at"
    t.string   "code"
    t.index ["code"], name: "index_pd_sessions_on_code", unique: true, using: :btree
    t.index ["pd_workshop_id"], name: "index_pd_sessions_on_pd_workshop_id", using: :btree
  end

  create_table "pd_teacher_applications", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.datetime "created_at",                              null: false
    t.datetime "updated_at",                              null: false
    t.integer  "user_id",                                 null: false
    t.string   "primary_email",                           null: false
    t.string   "secondary_email",                         null: false
    t.text     "application",               limit: 65535, null: false
    t.string   "regional_partner_override"
    t.integer  "program_registration_id",                              comment: "Id in the Pegasus forms table for the associated registration (kind: PdProgramRegistration), populated when that form is processed."
    t.index ["primary_email"], name: "index_pd_teacher_applications_on_primary_email", using: :btree
    t.index ["secondary_email"], name: "index_pd_teacher_applications_on_secondary_email", using: :btree
    t.index ["user_id"], name: "index_pd_teacher_applications_on_user_id", unique: true, using: :btree
  end

  create_table "pd_teachercon1819_registrations", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "pd_application_id"
    t.text     "form_data",           limit: 65535
    t.datetime "created_at",                        null: false
    t.datetime "updated_at",                        null: false
    t.integer  "regional_partner_id"
    t.index ["pd_application_id"], name: "index_pd_teachercon1819_registrations_on_pd_application_id", using: :btree
    t.index ["regional_partner_id"], name: "index_pd_teachercon1819_registrations_on_regional_partner_id", using: :btree
  end

  create_table "pd_teachercon_surveys", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "pd_enrollment_id",               null: false
    t.text     "form_data",        limit: 65535, null: false
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
    t.index ["pd_enrollment_id"], name: "index_pd_teachercon_surveys_on_pd_enrollment_id", unique: true, using: :btree
  end

  create_table "pd_workshop_material_orders", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.datetime "created_at",                                 null: false
    t.datetime "updated_at",                                 null: false
    t.integer  "pd_enrollment_id",                           null: false
    t.integer  "user_id",                                    null: false
    t.string   "school_or_company"
    t.string   "street",                                     null: false
    t.string   "apartment_or_suite"
    t.string   "city",                                       null: false
    t.string   "state",                                      null: false
    t.string   "zip_code",                                   null: false
    t.string   "phone_number",                               null: false
    t.datetime "order_attempted_at"
    t.datetime "ordered_at"
    t.text     "order_response",               limit: 65535
    t.text     "order_error",                  limit: 65535
    t.string   "order_id"
    t.string   "order_status"
    t.datetime "order_status_last_checked_at"
    t.datetime "order_status_changed_at"
    t.string   "tracking_id"
    t.string   "tracking_url"
    t.index ["pd_enrollment_id"], name: "index_pd_workshop_material_orders_on_pd_enrollment_id", unique: true, using: :btree
    t.index ["user_id"], name: "index_pd_workshop_material_orders_on_user_id", unique: true, using: :btree
  end

  create_table "pd_workshop_surveys", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "pd_enrollment_id",               null: false
    t.text     "form_data",        limit: 65535, null: false
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
    t.string   "type"
    t.index ["pd_enrollment_id"], name: "index_pd_workshop_surveys_on_pd_enrollment_id", unique: true, using: :btree
  end

  create_table "pd_workshops", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "organizer_id",                      null: false
    t.string   "location_name"
    t.string   "location_address"
    t.text     "processed_location",  limit: 65535
    t.string   "course",                            null: false
    t.string   "subject"
    t.integer  "capacity",                          null: false
    t.text     "notes",               limit: 65535
    t.integer  "section_id"
    t.datetime "started_at"
    t.datetime "ended_at"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.datetime "processed_at"
    t.datetime "deleted_at"
    t.integer  "regional_partner_id"
    t.boolean  "on_map",                                         comment: "Should this workshop appear on the 'Find a Workshop' map?"
    t.boolean  "funded",                                         comment: "Should this workshop's attendees be reimbursed?"
    t.index ["organizer_id"], name: "index_pd_workshops_on_organizer_id", using: :btree
    t.index ["regional_partner_id"], name: "index_pd_workshops_on_regional_partner_id", using: :btree
  end

  create_table "pd_workshops_facilitators", id: false, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer "pd_workshop_id", null: false
    t.integer "user_id",        null: false
    t.index ["pd_workshop_id"], name: "index_pd_workshops_facilitators_on_pd_workshop_id", using: :btree
    t.index ["user_id"], name: "index_pd_workshops_facilitators_on_user_id", using: :btree
  end

  create_table "peer_reviews", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "submitter_id"
    t.integer  "reviewer_id"
    t.boolean  "from_instructor",               default: false, null: false
    t.integer  "script_id",                                     null: false
    t.integer  "level_id",                                      null: false
    t.integer  "level_source_id",                               null: false
    t.text     "data",            limit: 65535
    t.integer  "status"
    t.datetime "created_at",                                    null: false
    t.datetime "updated_at",                                    null: false
    t.text     "audit_trail",     limit: 65535,                              comment: "Human-readable (never machine-parsed) audit trail of assignments and status changes with timestamps for the life of the peer review."
    t.index ["level_id"], name: "index_peer_reviews_on_level_id", using: :btree
    t.index ["level_source_id"], name: "index_peer_reviews_on_level_source_id", using: :btree
    t.index ["reviewer_id"], name: "index_peer_reviews_on_reviewer_id", using: :btree
    t.index ["script_id"], name: "index_peer_reviews_on_script_id", using: :btree
    t.index ["submitter_id"], name: "index_peer_reviews_on_submitter_id", using: :btree
  end

  create_table "plc_course_units", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "plc_course_id"
    t.string   "unit_name"
    t.text     "unit_description", limit: 65535
    t.integer  "unit_order"
    t.datetime "created_at",                                     null: false
    t.datetime "updated_at",                                     null: false
    t.integer  "script_id"
    t.boolean  "started",                        default: false, null: false
    t.index ["plc_course_id"], name: "index_plc_course_units_on_plc_course_id", using: :btree
    t.index ["script_id"], name: "index_plc_course_units_on_script_id", using: :btree
  end

  create_table "plc_courses", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer  "course_id"
    t.index ["course_id"], name: "fk_rails_d5fc777f73", using: :btree
  end

  create_table "plc_enrollment_module_assignments", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "plc_enrollment_unit_assignment_id"
    t.integer  "plc_learning_module_id"
    t.datetime "created_at",                        null: false
    t.datetime "updated_at",                        null: false
    t.integer  "user_id"
    t.index ["plc_enrollment_unit_assignment_id"], name: "module_assignment_enrollment_index", using: :btree
    t.index ["plc_learning_module_id"], name: "module_assignment_lm_index", using: :btree
    t.index ["user_id"], name: "index_plc_enrollment_module_assignments_on_user_id", using: :btree
  end

  create_table "plc_enrollment_unit_assignments", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "plc_user_course_enrollment_id"
    t.integer  "plc_course_unit_id"
    t.string   "status"
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
    t.integer  "user_id"
    t.index ["plc_course_unit_id"], name: "enrollment_unit_assignment_course_unit_index", using: :btree
    t.index ["plc_user_course_enrollment_id"], name: "enrollment_unit_assignment_course_enrollment_index", using: :btree
    t.index ["user_id"], name: "index_plc_enrollment_unit_assignments_on_user_id", using: :btree
  end

  create_table "plc_learning_modules", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "name"
    t.datetime "created_at",         null: false
    t.datetime "updated_at",         null: false
    t.integer  "plc_course_unit_id", null: false
    t.string   "module_type"
    t.integer  "stage_id"
    t.index ["plc_course_unit_id"], name: "index_plc_learning_modules_on_plc_course_unit_id", using: :btree
    t.index ["stage_id"], name: "index_plc_learning_modules_on_stage_id", using: :btree
  end

  create_table "plc_learning_modules_tasks", id: false, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer "plc_learning_module_id", null: false
    t.integer "plc_task_id",            null: false
    t.index ["plc_learning_module_id"], name: "index_plc_learning_modules_tasks_on_plc_learning_module_id", using: :btree
    t.index ["plc_task_id"], name: "index_plc_learning_modules_tasks_on_plc_task_id", using: :btree
  end

  create_table "plc_tasks", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "name"
    t.datetime "created_at",                                          null: false
    t.datetime "updated_at",                                          null: false
    t.string   "type",                          default: "Plc::Task", null: false
    t.text     "properties",      limit: 65535
    t.integer  "script_level_id"
    t.index ["script_level_id"], name: "index_plc_tasks_on_script_level_id", using: :btree
  end

  create_table "plc_user_course_enrollments", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "status"
    t.integer  "plc_course_id"
    t.integer  "user_id"
    t.datetime "created_at",    null: false
    t.datetime "updated_at",    null: false
    t.index ["plc_course_id"], name: "index_plc_user_course_enrollments_on_plc_course_id", using: :btree
    t.index ["user_id", "plc_course_id"], name: "index_plc_user_course_enrollments_on_user_id_and_plc_course_id", unique: true, using: :btree
  end

  create_table "puzzle_ratings", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "user_id"
    t.integer  "script_id"
    t.integer  "level_id"
    t.integer  "rating"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["script_id", "level_id"], name: "index_puzzle_ratings_on_script_id_and_level_id", using: :btree
    t.index ["user_id", "script_id", "level_id"], name: "index_puzzle_ratings_on_user_id_and_script_id_and_level_id", unique: true, using: :btree
  end

  create_table "regional_partner_program_managers", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer "program_manager_id",  null: false
    t.integer "regional_partner_id", null: false
    t.index ["program_manager_id"], name: "index_regional_partner_program_managers_on_program_manager_id", using: :btree
    t.index ["regional_partner_id"], name: "index_regional_partner_program_managers_on_regional_partner_id", using: :btree
  end

  create_table "regional_partners", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "name",                             null: false
    t.integer  "group"
    t.integer  "contact_id"
    t.boolean  "urban"
    t.string   "attention"
    t.string   "street"
    t.string   "apartment_or_suite"
    t.string   "city"
    t.string   "state"
    t.string   "zip_code"
    t.string   "phone_number"
    t.text     "notes",              limit: 65535
    t.datetime "created_at",                       null: false
    t.datetime "updated_at",                       null: false
    t.index ["name", "contact_id"], name: "index_regional_partners_on_name_and_contact_id", unique: true, using: :btree
  end

  create_table "regional_partners_school_districts", id: false, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer "regional_partner_id", null: false
    t.integer "school_district_id",  null: false
    t.string  "course",                           comment: "Course for a given workshop"
    t.string  "workshop_days",                    comment: "Days that the workshop will take place"
    t.index ["regional_partner_id"], name: "index_regional_partners_school_districts_on_partner_id", using: :btree
    t.index ["school_district_id"], name: "index_regional_partners_school_districts_on_school_district_id", using: :btree
  end

  create_table "school_districts", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "name",       null: false
    t.string   "city",       null: false
    t.string   "state",      null: false
    t.string   "zip",        null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name", "city"], name: "index_school_districts_on_name_and_city", type: :fulltext
    t.index ["state"], name: "index_school_districts_on_state", using: :btree
  end

  create_table "school_infos", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "country"
    t.string   "school_type"
    t.integer  "zip"
    t.string   "state"
    t.integer  "school_district_id"
    t.boolean  "school_district_other",            default: false
    t.string   "school_district_name"
    t.string   "school_id",             limit: 12
    t.boolean  "school_other",                     default: false
    t.string   "school_name",                                                    comment: "This column appears to be redundant with pd_enrollments.school and users.school, therefore validation rules must be used to ensure that any user or enrollment with a school_info has its school name stored in the correct place."
    t.string   "full_address",                                                   comment: "This column appears to be redundant with users.full_address, therefore validation rules must be used to ensure that any user with a school_info has its school address stored in the correct place."
    t.datetime "created_at",                                        null: false
    t.datetime "updated_at",                                        null: false
    t.string   "validation_type",                  default: "full", null: false
    t.index ["school_district_id"], name: "fk_rails_951bceb7e3", using: :btree
    t.index ["school_id"], name: "index_school_infos_on_school_id", using: :btree
  end

  create_table "school_stats_by_years", primary_key: ["school_id", "school_year"], force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "school_id",          limit: 12, null: false, comment: "NCES public school ID"
    t.string   "school_year",        limit: 9,  null: false, comment: "School Year"
    t.string   "grades_offered_lo",  limit: 2,               comment: "Grades Offered - Lowest"
    t.string   "grades_offered_hi",  limit: 2,               comment: "Grades Offered - Highest"
    t.boolean  "grade_pk_offered",                           comment: "PK Grade Offered"
    t.boolean  "grade_kg_offered",                           comment: "KG Grade Offered"
    t.boolean  "grade_01_offered",                           comment: "Grade 01 Offered"
    t.boolean  "grade_02_offered",                           comment: "Grade 02 Offered"
    t.boolean  "grade_03_offered",                           comment: "Grade 03 Offered"
    t.boolean  "grade_04_offered",                           comment: "Grade 04 Offered"
    t.boolean  "grade_05_offered",                           comment: "Grade 05 Offered"
    t.boolean  "grade_06_offered",                           comment: "Grade 06 Offered"
    t.boolean  "grade_07_offered",                           comment: "Grade 07 Offered"
    t.boolean  "grade_08_offered",                           comment: "Grade 08 Offered"
    t.boolean  "grade_09_offered",                           comment: "Grade 09 Offered"
    t.boolean  "grade_10_offered",                           comment: "Grade 10 Offered"
    t.boolean  "grade_11_offered",                           comment: "Grade 11 Offered"
    t.boolean  "grade_12_offered",                           comment: "Grade 12 Offered"
    t.boolean  "grade_13_offered",                           comment: "Grade 13 Offered"
    t.string   "virtual_status",     limit: 14,              comment: "Virtual School Status"
    t.integer  "students_total",                             comment: "Total students, all grades (includes AE)"
    t.integer  "student_am_count",                           comment: "All Students - American Indian/Alaska Native"
    t.integer  "student_as_count",                           comment: "All Students - Asian"
    t.integer  "student_hi_count",                           comment: "All Students - Hispanic"
    t.integer  "student_bl_count",                           comment: "All Students - Black"
    t.integer  "student_wh_count",                           comment: "All Students - White"
    t.integer  "student_hp_count",                           comment: "All Students - Hawaiian Native/Pacific Islander"
    t.integer  "student_tr_count",                           comment: "All Students - Two or More Races"
    t.string   "title_i_status",     limit: 1,               comment: "TITLE I status (code)"
    t.integer  "frl_eligible_total",                         comment: "Total of free and reduced-price lunch eligible"
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
    t.string   "community_type",     limit: 16,              comment: "Urban-centric community type"
    t.index ["school_id"], name: "index_school_stats_by_years_on_school_id", using: :btree
  end

  create_table "schools", id: false, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "id",                 limit: 12,                         null: false, comment: "NCES public school ID"
    t.integer  "school_district_id"
    t.string   "name",                                                  null: false
    t.string   "city",                                                  null: false
    t.string   "state",                                                 null: false
    t.string   "zip",                                                   null: false
    t.string   "school_type",                                           null: false
    t.datetime "created_at",                                            null: false
    t.datetime "updated_at",                                            null: false
    t.string   "address_line1",      limit: 50,                                      comment: "Location address, street 1"
    t.string   "address_line2",      limit: 30,                                      comment: "Location address, street 2"
    t.string   "address_line3",      limit: 30,                                      comment: "Location address, street 3"
    t.decimal  "latitude",                      precision: 8, scale: 6,              comment: "Location latitude"
    t.decimal  "longitude",                     precision: 9, scale: 6,              comment: "Location longitude"
    t.string   "state_school_id"
    t.index ["id"], name: "index_schools_on_id", unique: true, using: :btree
    t.index ["name", "city"], name: "index_schools_on_name_and_city", type: :fulltext
    t.index ["school_district_id"], name: "index_schools_on_school_district_id", using: :btree
    t.index ["state_school_id"], name: "index_schools_on_state_school_id", unique: true, using: :btree
    t.index ["zip"], name: "index_schools_on_zip", using: :btree
  end

  create_table "script_levels", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "script_id",                 null: false
    t.integer  "chapter"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "stage_id"
    t.integer  "position"
    t.boolean  "assessment"
    t.text     "properties",  limit: 65535
    t.boolean  "named_level"
    t.boolean  "bonus"
    t.index ["script_id"], name: "index_script_levels_on_script_id", using: :btree
    t.index ["stage_id"], name: "index_script_levels_on_stage_id", using: :btree
  end

  create_table "scripts", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "name",                                          null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "wrapup_video_id"
    t.boolean  "hidden",                        default: false, null: false
    t.integer  "user_id"
    t.boolean  "login_required",                default: false, null: false
    t.text     "properties",      limit: 65535
    t.index ["name"], name: "index_scripts_on_name", unique: true, using: :btree
    t.index ["wrapup_video_id"], name: "index_scripts_on_wrapup_video_id", using: :btree
  end

  create_table "secret_pictures", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "name",       null: false
    t.string   "path",       null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["name"], name: "index_secret_pictures_on_name", unique: true, using: :btree
    t.index ["path"], name: "index_secret_pictures_on_path", unique: true, using: :btree
  end

  create_table "secret_words", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "word",       null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["word"], name: "index_secret_words_on_word", unique: true, using: :btree
  end

  create_table "section_hidden_scripts", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer "section_id", null: false
    t.integer "script_id",  null: false
    t.index ["script_id"], name: "index_section_hidden_scripts_on_script_id", using: :btree
    t.index ["section_id"], name: "index_section_hidden_scripts_on_section_id", using: :btree
  end

  create_table "section_hidden_stages", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer "section_id", null: false
    t.integer "stage_id",   null: false
    t.index ["section_id"], name: "index_section_hidden_stages_on_section_id", using: :btree
    t.index ["stage_id"], name: "index_section_hidden_stages_on_stage_id", using: :btree
  end

  create_table "sections", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "user_id",                             null: false
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "code"
    t.integer  "script_id"
    t.integer  "course_id"
    t.string   "grade"
    t.string   "login_type",        default: "email", null: false
    t.datetime "deleted_at"
    t.boolean  "stage_extras",      default: false,   null: false
    t.string   "section_type"
    t.datetime "first_activity_at"
    t.boolean  "pairing_allowed",   default: true,    null: false
    t.boolean  "sharing_disabled",  default: false,   null: false, comment: "Flag indicates the default sharing setting for a section and is used to determine students share setting when adding a new student to the section."
    t.boolean  "hidden",            default: false,   null: false
    t.index ["code"], name: "index_sections_on_code", unique: true, using: :btree
    t.index ["course_id"], name: "fk_rails_20b1e5de46", using: :btree
    t.index ["user_id"], name: "index_sections_on_user_id", using: :btree
  end

  create_table "seeded_s3_objects", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "bucket"
    t.string   "key"
    t.string   "etag"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["bucket", "key", "etag"], name: "index_seeded_s3_objects_on_bucket_and_key_and_etag", using: :btree
  end

  create_table "segments", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "workshop_id", null: false
    t.datetime "start",       null: false
    t.datetime "end"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["end"], name: "index_segments_on_end", using: :btree
    t.index ["start"], name: "index_segments_on_start", using: :btree
    t.index ["workshop_id"], name: "index_segments_on_workshop_id", using: :btree
  end

  create_table "sign_ins", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "user_id",       null: false
    t.datetime "sign_in_at",    null: false
    t.integer  "sign_in_count", null: false
    t.index ["sign_in_at"], name: "index_sign_ins_on_sign_in_at", using: :btree
    t.index ["user_id"], name: "index_sign_ins_on_user_id", using: :btree
  end

  create_table "stages", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "name",                                            null: false
    t.integer  "absolute_position"
    t.integer  "script_id",                                       null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "flex_category"
    t.boolean  "lockable",                        default: false, null: false
    t.integer  "relative_position",                               null: false
    t.text     "properties",        limit: 65535
    t.index ["script_id"], name: "index_stages_on_script_id", using: :btree
  end

  create_table "state_cs_offerings", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "state_school_id",           null: false
    t.string   "course",                    null: false
    t.integer  "school_year",     limit: 2, null: false
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
    t.index ["state_school_id", "school_year", "course"], name: "index_state_cs_offerings_on_id_and_year_and_course", unique: true, using: :btree
  end

  create_table "studio_people", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string   "emails"
  end

  create_table "survey_results", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "user_id"
    t.string   "kind"
    t.text     "properties", limit: 65535
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
    t.index ["kind"], name: "index_survey_results_on_kind", using: :btree
    t.index ["user_id"], name: "index_survey_results_on_user_id", using: :btree
  end

  create_table "teacher_profiles", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "studio_person_id"
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
    t.string   "course",                         null: false
    t.boolean  "facilitator"
    t.boolean  "teaching"
    t.string   "pd_year"
    t.string   "pd"
    t.string   "other_pd"
    t.text     "properties",       limit: 65535
    t.index ["studio_person_id"], name: "index_teacher_profiles_on_studio_person_id", using: :btree
  end

  create_table "unexpected_teachers_workshops", id: false, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer "workshop_id",           null: false
    t.integer "unexpected_teacher_id", null: false
    t.index ["unexpected_teacher_id"], name: "index_unexpected_teachers_workshops_on_unexpected_teacher_id", using: :btree
    t.index ["workshop_id"], name: "index_unexpected_teachers_workshops_on_workshop_id", using: :btree
  end

  create_table "user_geos", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "user_id",                             null: false
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
    t.datetime "indexed_at"
    t.string   "ip_address"
    t.string   "city"
    t.string   "state"
    t.string   "country"
    t.string   "postal_code"
    t.decimal  "latitude",    precision: 8, scale: 6
    t.decimal  "longitude",   precision: 9, scale: 6
    t.index ["indexed_at"], name: "index_user_geos_on_indexed_at", using: :btree
    t.index ["user_id"], name: "index_user_geos_on_user_id", using: :btree
  end

  create_table "user_levels", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "user_id",                      null: false
    t.integer  "level_id",                     null: false
    t.integer  "attempts",         default: 0, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "best_result"
    t.integer  "script_id"
    t.integer  "level_source_id"
    t.boolean  "submitted"
    t.boolean  "readonly_answers"
    t.datetime "unlocked_at"
    t.index ["user_id", "level_id", "script_id"], name: "index_user_levels_on_user_id_and_level_id_and_script_id", unique: true, using: :btree
  end

  create_table "user_module_task_assignments", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer "user_enrollment_module_assignment_id"
    t.integer "professional_learning_task_id"
    t.string  "status"
    t.index ["professional_learning_task_id"], name: "task_assignment_to_task_index", using: :btree
    t.index ["user_enrollment_module_assignment_id"], name: "task_assignment_to_module_assignment_index", using: :btree
  end

  create_table "user_permissions", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "user_id",    null: false
    t.string   "permission", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["user_id", "permission"], name: "index_user_permissions_on_user_id_and_permission", unique: true, using: :btree
  end

  create_table "user_proficiencies", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "user_id",                                    null: false
    t.datetime "created_at",                                 null: false
    t.datetime "updated_at",                                 null: false
    t.datetime "last_progress_at"
    t.integer  "sequencing_d1_count",            default: 0
    t.integer  "sequencing_d2_count",            default: 0
    t.integer  "sequencing_d3_count",            default: 0
    t.integer  "sequencing_d4_count",            default: 0
    t.integer  "sequencing_d5_count",            default: 0
    t.integer  "debugging_d1_count",             default: 0
    t.integer  "debugging_d2_count",             default: 0
    t.integer  "debugging_d3_count",             default: 0
    t.integer  "debugging_d4_count",             default: 0
    t.integer  "debugging_d5_count",             default: 0
    t.integer  "repeat_loops_d1_count",          default: 0
    t.integer  "repeat_loops_d2_count",          default: 0
    t.integer  "repeat_loops_d3_count",          default: 0
    t.integer  "repeat_loops_d4_count",          default: 0
    t.integer  "repeat_loops_d5_count",          default: 0
    t.integer  "repeat_until_while_d1_count",    default: 0
    t.integer  "repeat_until_while_d2_count",    default: 0
    t.integer  "repeat_until_while_d3_count",    default: 0
    t.integer  "repeat_until_while_d4_count",    default: 0
    t.integer  "repeat_until_while_d5_count",    default: 0
    t.integer  "for_loops_d1_count",             default: 0
    t.integer  "for_loops_d2_count",             default: 0
    t.integer  "for_loops_d3_count",             default: 0
    t.integer  "for_loops_d4_count",             default: 0
    t.integer  "for_loops_d5_count",             default: 0
    t.integer  "events_d1_count",                default: 0
    t.integer  "events_d2_count",                default: 0
    t.integer  "events_d3_count",                default: 0
    t.integer  "events_d4_count",                default: 0
    t.integer  "events_d5_count",                default: 0
    t.integer  "variables_d1_count",             default: 0
    t.integer  "variables_d2_count",             default: 0
    t.integer  "variables_d3_count",             default: 0
    t.integer  "variables_d4_count",             default: 0
    t.integer  "variables_d5_count",             default: 0
    t.integer  "functions_d1_count",             default: 0
    t.integer  "functions_d2_count",             default: 0
    t.integer  "functions_d3_count",             default: 0
    t.integer  "functions_d4_count",             default: 0
    t.integer  "functions_d5_count",             default: 0
    t.integer  "functions_with_params_d1_count", default: 0
    t.integer  "functions_with_params_d2_count", default: 0
    t.integer  "functions_with_params_d3_count", default: 0
    t.integer  "functions_with_params_d4_count", default: 0
    t.integer  "functions_with_params_d5_count", default: 0
    t.integer  "conditionals_d1_count",          default: 0
    t.integer  "conditionals_d2_count",          default: 0
    t.integer  "conditionals_d3_count",          default: 0
    t.integer  "conditionals_d4_count",          default: 0
    t.integer  "conditionals_d5_count",          default: 0
    t.datetime "basic_proficiency_at"
    t.index ["user_id"], name: "index_user_proficiencies_on_user_id", unique: true, using: :btree
  end

  create_table "user_scripts", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "user_id",          null: false
    t.integer  "script_id",        null: false
    t.datetime "started_at"
    t.datetime "completed_at"
    t.datetime "assigned_at"
    t.datetime "last_progress_at"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["script_id"], name: "index_user_scripts_on_script_id", using: :btree
    t.index ["user_id", "script_id"], name: "index_user_scripts_on_user_id_and_script_id", unique: true, using: :btree
  end

  create_table "users", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "studio_person_id"
    t.string   "email",                                  default: "",      null: false
    t.string   "parent_email"
    t.string   "encrypted_password",                     default: ""
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",                          default: 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "username"
    t.string   "provider"
    t.string   "uid"
    t.boolean  "admin"
    t.string   "gender",                   limit: 1
    t.string   "name"
    t.string   "locale",                   limit: 10,    default: "en-US", null: false
    t.date     "birthday"
    t.string   "user_type",                limit: 16
    t.string   "school"
    t.string   "full_address",             limit: 1024
    t.integer  "school_info_id"
    t.integer  "total_lines",                            default: 0,       null: false
    t.integer  "secret_picture_id"
    t.boolean  "active",                                 default: true,    null: false
    t.string   "hashed_email"
    t.datetime "deleted_at"
    t.datetime "purged_at"
    t.string   "secret_words"
    t.text     "properties",               limit: 65535
    t.string   "invitation_token"
    t.datetime "invitation_created_at"
    t.datetime "invitation_sent_at"
    t.datetime "invitation_accepted_at"
    t.integer  "invitation_limit"
    t.integer  "invited_by_id"
    t.string   "invited_by_type"
    t.integer  "invitations_count",                      default: 0
    t.integer  "terms_of_service_version"
    t.boolean  "urm"
    t.string   "races"
    t.index ["birthday"], name: "index_users_on_birthday", using: :btree
    t.index ["current_sign_in_at"], name: "index_users_on_current_sign_in_at", using: :btree
    t.index ["deleted_at"], name: "index_users_on_deleted_at", using: :btree
    t.index ["email", "deleted_at"], name: "index_users_on_email_and_deleted_at", using: :btree
    t.index ["hashed_email", "deleted_at"], name: "index_users_on_hashed_email_and_deleted_at", using: :btree
    t.index ["invitation_token"], name: "index_users_on_invitation_token", unique: true, using: :btree
    t.index ["invitations_count"], name: "index_users_on_invitations_count", using: :btree
    t.index ["invited_by_id"], name: "index_users_on_invited_by_id", using: :btree
    t.index ["parent_email"], name: "index_users_on_parent_email", using: :btree
    t.index ["provider", "uid", "deleted_at"], name: "index_users_on_provider_and_uid_and_deleted_at", unique: true, using: :btree
    t.index ["purged_at"], name: "index_users_on_purged_at", using: :btree
    t.index ["reset_password_token", "deleted_at"], name: "index_users_on_reset_password_token_and_deleted_at", unique: true, using: :btree
    t.index ["school_info_id"], name: "index_users_on_school_info_id", using: :btree
    t.index ["studio_person_id"], name: "index_users_on_studio_person_id", using: :btree
    t.index ["username", "deleted_at"], name: "index_users_on_username_and_deleted_at", unique: true, using: :btree
  end

  create_table "videos", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "key"
    t.string   "youtube_code"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "download"
  end

  create_table "workshop_attendance", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "teacher_id",               null: false
    t.integer  "segment_id",               null: false
    t.string   "status"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "notes",      limit: 65535
    t.index ["segment_id"], name: "index_workshop_attendance_on_segment_id", using: :btree
    t.index ["teacher_id"], name: "index_workshop_attendance_on_teacher_id", using: :btree
  end

  create_table "workshop_cohorts", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "workshop_id", null: false
    t.integer  "cohort_id",   null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "workshops", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "name"
    t.string   "program_type",              null: false
    t.string   "location",     limit: 1000
    t.string   "instructions", limit: 1000
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "phase"
    t.index ["name"], name: "index_workshops_on_name", using: :btree
    t.index ["program_type"], name: "index_workshops_on_program_type", using: :btree
  end

  add_foreign_key "ap_school_codes", "schools"
  add_foreign_key "authored_hint_view_requests", "levels"
  add_foreign_key "authored_hint_view_requests", "scripts"
  add_foreign_key "authored_hint_view_requests", "users"
  add_foreign_key "census_submission_form_maps", "census_submissions"
  add_foreign_key "census_summaries", "schools"
  add_foreign_key "circuit_playground_discount_applications", "schools"
  add_foreign_key "hint_view_requests", "users"
  add_foreign_key "ib_school_codes", "schools"
  add_foreign_key "level_concept_difficulties", "levels"
  add_foreign_key "pd_payment_terms", "regional_partners"
  add_foreign_key "pd_regional_partner_cohorts", "pd_workshops", column: "summer_workshop_id"
  add_foreign_key "pd_teachercon1819_registrations", "regional_partners"
  add_foreign_key "pd_workshops", "regional_partners"
  add_foreign_key "peer_reviews", "level_sources"
  add_foreign_key "peer_reviews", "levels"
  add_foreign_key "peer_reviews", "scripts"
  add_foreign_key "peer_reviews", "users", column: "reviewer_id"
  add_foreign_key "peer_reviews", "users", column: "submitter_id"
  add_foreign_key "plc_course_units", "scripts"
  add_foreign_key "plc_courses", "courses"
  add_foreign_key "plc_learning_modules", "stages"
  add_foreign_key "plc_tasks", "script_levels"
  add_foreign_key "school_infos", "school_districts"
  add_foreign_key "school_infos", "schools"
  add_foreign_key "school_stats_by_years", "schools"
  add_foreign_key "schools", "school_districts"
  add_foreign_key "sections", "courses"
  add_foreign_key "state_cs_offerings", "schools", column: "state_school_id", primary_key: "state_school_id"
  add_foreign_key "survey_results", "users"
  add_foreign_key "user_geos", "users"
  add_foreign_key "user_proficiencies", "users"
end
