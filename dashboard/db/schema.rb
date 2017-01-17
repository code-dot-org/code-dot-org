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

ActiveRecord::Schema.define(version: 20170112235804) do

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

  create_table "authored_hint_view_requests", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "user_id"
    t.integer  "script_id"
    t.integer  "level_id"
    t.string   "hint_id"
    t.string   "hint_class"
    t.string   "hint_type"
    t.integer  "prev_time"
    t.integer  "prev_attempt"
    t.integer  "prev_test_result"
    t.integer  "prev_activity_id"
    t.integer  "prev_level_source_id"
    t.integer  "next_time"
    t.integer  "next_attempt"
    t.integer  "next_test_result"
    t.integer  "next_activity_id"
    t.integer  "next_level_source_id"
    t.integer  "final_time"
    t.integer  "final_attempt"
    t.integer  "final_test_result"
    t.integer  "final_activity_id"
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

  create_table "channel_tokens", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "channel",    null: false
    t.integer  "user_id",    null: false
    t.integer  "level_id",   null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["user_id", "level_id"], name: "index_channel_tokens_on_user_id_and_level_id", unique: true, using: :btree
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

  create_table "facilitators_workshops", id: false, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer "workshop_id",    null: false
    t.integer "facilitator_id", null: false
  end

  create_table "followers", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "user_id",         null: false
    t.integer  "student_user_id", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "section_id"
    t.datetime "deleted_at"
    t.index ["section_id"], name: "index_followers_on_section_id", using: :btree
    t.index ["student_user_id"], name: "index_followers_on_student_user_id", using: :btree
    t.index ["user_id", "student_user_id"], name: "index_followers_on_user_id_and_student_user_id", using: :btree
  end

  create_table "gallery_activities", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "user_id",                            null: false
    t.integer  "activity_id",                        null: false
    t.integer  "user_level_id"
    t.integer  "level_source_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "autosaved"
    t.string   "app",             default: "turtle", null: false
    t.index ["activity_id"], name: "index_gallery_activities_on_activity_id", using: :btree
    t.index ["app", "autosaved"], name: "index_gallery_activities_on_app_and_autosaved", using: :btree
    t.index ["level_source_id"], name: "index_gallery_activities_on_level_source_id", using: :btree
    t.index ["user_id", "activity_id"], name: "index_gallery_activities_on_user_id_and_activity_id", unique: true, using: :btree
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
    t.string   "name",                                                   null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "level_num"
    t.integer  "ideal_level_source_id"
    t.integer  "solution_level_source_id"
    t.integer  "user_id"
    t.text     "properties",               limit: 65535
    t.string   "type"
    t.string   "md5"
    t.boolean  "published",                              default: false, null: false
    t.text     "notes",                    limit: 65535
    t.index ["game_id"], name: "index_levels_on_game_id", using: :btree
    t.index ["name"], name: "index_levels_on_name", using: :btree
  end

  create_table "levels_script_levels", id: false, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer "level_id",        null: false
    t.integer "script_level_id", null: false
    t.index ["level_id"], name: "index_levels_script_levels_on_level_id", using: :btree
    t.index ["script_level_id"], name: "index_levels_script_levels_on_script_level_id", using: :btree
  end

  create_table "paired_user_levels", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "driver_user_level_id"
    t.integer  "navigator_user_level_id"
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
    t.index ["driver_user_level_id"], name: "index_paired_user_levels_on_driver_user_level_id", using: :btree
    t.index ["navigator_user_level_id"], name: "index_paired_user_levels_on_navigator_user_level_id", using: :btree
  end

  create_table "pd_attendances", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "pd_session_id",    null: false
    t.integer  "teacher_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.datetime "deleted_at"
    t.integer  "pd_enrollment_id"
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
    t.index ["pd_workshop_id"], name: "index_pd_enrollments_on_pd_workshop_id", using: :btree
  end

  create_table "pd_sessions", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "pd_workshop_id"
    t.datetime "start",          null: false
    t.datetime "end",            null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.datetime "deleted_at"
    t.index ["pd_workshop_id"], name: "index_pd_sessions_on_pd_workshop_id", using: :btree
  end

  create_table "pd_teacher_applications", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.datetime "created_at",                      null: false
    t.datetime "updated_at",                      null: false
    t.integer  "user_id",                         null: false
    t.string   "primary_email",                   null: false
    t.string   "secondary_email",                 null: false
    t.text     "application",       limit: 65535, null: false
    t.string   "accepted_workshop"
    t.index ["primary_email"], name: "index_pd_teacher_applications_on_primary_email", using: :btree
    t.index ["secondary_email"], name: "index_pd_teacher_applications_on_secondary_email", using: :btree
    t.index ["user_id"], name: "index_pd_teacher_applications_on_user_id", unique: true, using: :btree
  end

  create_table "pd_workshops", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "workshop_type",                    null: false
    t.integer  "organizer_id",                     null: false
    t.string   "location_name"
    t.string   "location_address"
    t.text     "processed_location", limit: 65535
    t.string   "course",                           null: false
    t.string   "subject"
    t.integer  "capacity",                         null: false
    t.text     "notes",              limit: 65535
    t.integer  "section_id"
    t.datetime "started_at"
    t.datetime "ended_at"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.datetime "processed_at"
    t.datetime "deleted_at"
    t.index ["organizer_id"], name: "index_pd_workshops_on_organizer_id", using: :btree
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
    t.index ["level_id"], name: "index_peer_reviews_on_level_id", using: :btree
    t.index ["level_source_id"], name: "index_peer_reviews_on_level_source_id", using: :btree
    t.index ["reviewer_id"], name: "index_peer_reviews_on_reviewer_id", using: :btree
    t.index ["script_id"], name: "index_peer_reviews_on_script_id", using: :btree
    t.index ["submitter_id"], name: "index_peer_reviews_on_submitter_id", using: :btree
  end

  create_table "plc_course_units", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "plc_course_id"
    t.string   "unit_name"
    t.string   "unit_description"
    t.integer  "unit_order"
    t.datetime "created_at",                       null: false
    t.datetime "updated_at",                       null: false
    t.integer  "script_id"
    t.boolean  "started",          default: false, null: false
    t.index ["plc_course_id"], name: "index_plc_course_units_on_plc_course_id", using: :btree
    t.index ["script_id"], name: "index_plc_course_units_on_script_id", using: :btree
  end

  create_table "plc_courses", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
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

  create_table "plc_evaluation_answers", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "answer"
    t.integer  "plc_evaluation_question_id"
    t.datetime "created_at",                             null: false
    t.datetime "updated_at",                             null: false
    t.integer  "plc_learning_module_id"
    t.integer  "weight",                     default: 1, null: false
    t.index ["plc_evaluation_question_id"], name: "index_plc_evaluation_answers_on_plc_evaluation_question_id", using: :btree
    t.index ["plc_learning_module_id"], name: "index_plc_evaluation_answers_on_plc_learning_module_id", using: :btree
  end

  create_table "plc_evaluation_questions", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "question"
    t.integer  "plc_course_unit_id"
    t.datetime "created_at",         null: false
    t.datetime "updated_at",         null: false
    t.index ["plc_course_unit_id"], name: "index_plc_evaluation_questions_on_plc_course_unit_id", using: :btree
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

  create_table "prize_providers", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "name"
    t.string   "url"
    t.string   "description_token"
    t.string   "image_name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "prizes", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "prize_provider_id", null: false
    t.string   "code",              null: false
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["prize_provider_id"], name: "index_prizes_on_prize_provider_id", using: :btree
    t.index ["user_id"], name: "index_prizes_on_user_id", using: :btree
  end

  create_table "professional_learning_partners", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string  "name",       null: false
    t.integer "contact_id", null: false
    t.boolean "urban"
    t.index ["name", "contact_id"], name: "index_professional_learning_partners_on_name_and_contact_id", unique: true, using: :btree
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

  create_table "regional_partners", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string  "name",  null: false
    t.integer "group", null: false
  end

  create_table "regional_partners_school_districts", id: false, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer "regional_partner_id", null: false
    t.integer "school_district_id",  null: false
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
    t.index ["state"], name: "index_school_districts_on_state", using: :btree
  end

  create_table "school_infos", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "country"
    t.string   "school_type"
    t.integer  "zip"
    t.string   "state"
    t.integer  "school_district_id"
    t.boolean  "school_district_other", default: false
    t.string   "school_district_name"
    t.bigint   "school_id"
    t.boolean  "school_other",          default: false
    t.string   "school_name",                                        comment: "This column appears to be redundant with pd_enrollments.school and users.school, therefore validation rules must be used to ensure that any user or enrollment with a school_info has its school name stored in the correct place."
    t.string   "full_address",                                       comment: "This column appears to be redundant with users.full_address, therefore validation rules must be used to ensure that any user with a school_info has its school address stored in the correct place."
    t.datetime "created_at",                            null: false
    t.datetime "updated_at",                            null: false
    t.index ["school_district_id"], name: "fk_rails_951bceb7e3", using: :btree
    t.index ["school_id"], name: "index_school_infos_on_school_id", using: :btree
  end

  create_table "schools", id: false, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.bigint   "id",                 null: false, comment: "NCES public school ID"
    t.integer  "school_district_id", null: false
    t.string   "name",               null: false
    t.string   "city",               null: false
    t.string   "state",              null: false
    t.string   "zip",                null: false
    t.string   "school_type",        null: false
    t.datetime "created_at",         null: false
    t.datetime "updated_at",         null: false
    t.index ["id"], name: "index_schools_on_id", unique: true, using: :btree
    t.index ["school_district_id"], name: "index_schools_on_school_district_id", using: :btree
  end

  create_table "script_levels", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "level_id"
    t.integer  "script_id",                 null: false
    t.integer  "chapter"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "stage_id"
    t.integer  "position"
    t.boolean  "assessment"
    t.text     "properties",  limit: 65535
    t.boolean  "named_level"
    t.index ["level_id"], name: "index_script_levels_on_level_id", using: :btree
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

  create_table "section_hidden_stages", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer "section_id", null: false
    t.integer "stage_id",   null: false
    t.index ["section_id"], name: "index_section_hidden_stages_on_section_id", using: :btree
    t.index ["stage_id"], name: "index_section_hidden_stages_on_stage_id", using: :btree
  end

  create_table "sections", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "user_id",                        null: false
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "code"
    t.integer  "script_id"
    t.string   "grade"
    t.string   "admin_code"
    t.string   "login_type",   default: "email", null: false
    t.datetime "deleted_at"
    t.boolean  "stage_extras", default: false,   null: false
    t.string   "section_type"
    t.index ["code"], name: "index_sections_on_code", unique: true, using: :btree
    t.index ["user_id"], name: "index_sections_on_user_id", using: :btree
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

  create_table "stages", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.string   "name",              null: false
    t.integer  "absolute_position"
    t.integer  "script_id",         null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "flex_category"
    t.boolean  "lockable"
    t.integer  "relative_position", null: false
    t.index ["script_id"], name: "index_stages_on_script_id", using: :btree
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

  create_table "teacher_bonus_prizes", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "prize_provider_id", null: false
    t.string   "code",              null: false
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["prize_provider_id"], name: "index_teacher_bonus_prizes_on_prize_provider_id", using: :btree
    t.index ["user_id"], name: "index_teacher_bonus_prizes_on_user_id", using: :btree
  end

  create_table "teacher_prizes", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci" do |t|
    t.integer  "prize_provider_id", null: false
    t.string   "code",              null: false
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["prize_provider_id"], name: "index_teacher_prizes_on_prize_provider_id", using: :btree
    t.index ["user_id"], name: "index_teacher_prizes_on_user_id", using: :btree
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
    t.index ["user_id"], name: "index_user_proficiencies_on_user_id", using: :btree
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
    t.string   "email",                                    default: "",      null: false
    t.string   "encrypted_password",                       default: ""
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",                            default: 0
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
    t.string   "gender",                     limit: 1
    t.string   "name"
    t.string   "locale",                     limit: 10,    default: "en-US", null: false
    t.date     "birthday"
    t.string   "user_type",                  limit: 16
    t.string   "school"
    t.string   "full_address",               limit: 1024
    t.integer  "total_lines",                              default: 0,       null: false
    t.boolean  "prize_earned",                             default: false
    t.integer  "prize_id"
    t.boolean  "teacher_prize_earned",                     default: false
    t.integer  "teacher_prize_id"
    t.boolean  "teacher_bonus_prize_earned",               default: false
    t.integer  "teacher_bonus_prize_id"
    t.string   "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email"
    t.integer  "prize_teacher_id"
    t.integer  "secret_picture_id"
    t.boolean  "active",                                   default: true,    null: false
    t.string   "hashed_email"
    t.datetime "deleted_at"
    t.string   "secret_words"
    t.text     "properties",                 limit: 65535
    t.string   "invitation_token"
    t.datetime "invitation_created_at"
    t.datetime "invitation_sent_at"
    t.datetime "invitation_accepted_at"
    t.integer  "invitation_limit"
    t.integer  "invited_by_id"
    t.string   "invited_by_type"
    t.integer  "invitations_count",                        default: 0
    t.integer  "terms_of_service_version"
    t.index ["birthday"], name: "index_users_on_birthday", using: :btree
    t.index ["confirmation_token", "deleted_at"], name: "index_users_on_confirmation_token_and_deleted_at", unique: true, using: :btree
    t.index ["email", "deleted_at"], name: "index_users_on_email_and_deleted_at", using: :btree
    t.index ["hashed_email", "deleted_at"], name: "index_users_on_hashed_email_and_deleted_at", using: :btree
    t.index ["invitation_token"], name: "index_users_on_invitation_token", unique: true, using: :btree
    t.index ["invitations_count"], name: "index_users_on_invitations_count", using: :btree
    t.index ["invited_by_id"], name: "index_users_on_invited_by_id", using: :btree
    t.index ["prize_id", "deleted_at"], name: "index_users_on_prize_id_and_deleted_at", unique: true, using: :btree
    t.index ["provider", "uid", "deleted_at"], name: "index_users_on_provider_and_uid_and_deleted_at", unique: true, using: :btree
    t.index ["reset_password_token", "deleted_at"], name: "index_users_on_reset_password_token_and_deleted_at", unique: true, using: :btree
    t.index ["studio_person_id"], name: "index_users_on_studio_person_id", using: :btree
    t.index ["teacher_bonus_prize_id", "deleted_at"], name: "index_users_on_teacher_bonus_prize_id_and_deleted_at", unique: true, using: :btree
    t.index ["teacher_prize_id", "deleted_at"], name: "index_users_on_teacher_prize_id_and_deleted_at", unique: true, using: :btree
    t.index ["unconfirmed_email", "deleted_at"], name: "index_users_on_unconfirmed_email_and_deleted_at", using: :btree
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

  add_foreign_key "authored_hint_view_requests", "levels"
  add_foreign_key "authored_hint_view_requests", "scripts"
  add_foreign_key "authored_hint_view_requests", "users"
  add_foreign_key "hint_view_requests", "users"
  add_foreign_key "level_concept_difficulties", "levels"
  add_foreign_key "peer_reviews", "level_sources"
  add_foreign_key "peer_reviews", "levels"
  add_foreign_key "peer_reviews", "scripts"
  add_foreign_key "peer_reviews", "users", column: "reviewer_id"
  add_foreign_key "peer_reviews", "users", column: "submitter_id"
  add_foreign_key "plc_course_units", "scripts"
  add_foreign_key "plc_learning_modules", "stages"
  add_foreign_key "plc_tasks", "script_levels"
  add_foreign_key "school_infos", "school_districts"
  add_foreign_key "school_infos", "schools"
  add_foreign_key "schools", "school_districts"
  add_foreign_key "survey_results", "users"
  add_foreign_key "user_geos", "users"
  add_foreign_key "user_proficiencies", "users"
end
