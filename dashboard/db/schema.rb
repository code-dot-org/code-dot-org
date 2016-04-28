# encoding: UTF-8
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

ActiveRecord::Schema.define(version: 20160428020044) do

  create_table "activities", force: :cascade do |t|
    t.integer  "user_id",         limit: 4
    t.integer  "level_id",        limit: 4
    t.string   "action",          limit: 255
    t.string   "url",             limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "attempt",         limit: 4
    t.integer  "time",            limit: 4
    t.integer  "test_result",     limit: 4
    t.integer  "level_source_id", limit: 4
    t.integer  "lines",           limit: 4,   default: 0, null: false
  end

  add_index "activities", ["level_source_id"], name: "index_activities_on_level_source_id", using: :btree
  add_index "activities", ["user_id", "level_id"], name: "index_activities_on_user_id_and_level_id", using: :btree

  create_table "activity_hints", force: :cascade do |t|
    t.integer  "activity_id",          limit: 4, null: false
    t.integer  "level_source_hint_id", limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "hint_visibility",      limit: 4
    t.integer  "ip_hash",              limit: 4
  end

  add_index "activity_hints", ["activity_id"], name: "index_activity_hints_on_activity_id", using: :btree
  add_index "activity_hints", ["level_source_hint_id"], name: "index_activity_hints_on_level_source_hint_id", using: :btree

  create_table "authored_hint_view_requests", force: :cascade do |t|
    t.integer  "user_id",               limit: 4
    t.integer  "script_id",             limit: 4
    t.integer  "level_id",              limit: 4
    t.string   "hint_id",               limit: 255
    t.string   "hint_class",            limit: 255
    t.string   "hint_type",             limit: 255
    t.integer  "prev_time",             limit: 4
    t.integer  "prev_attempt",          limit: 4
    t.integer  "prev_test_result",      limit: 4
    t.integer  "prev_activity_id",      limit: 4
    t.integer  "prev_level_source_id",  limit: 4
    t.integer  "next_time",             limit: 4
    t.integer  "next_attempt",          limit: 4
    t.integer  "next_test_result",      limit: 4
    t.integer  "next_activity_id",      limit: 4
    t.integer  "next_level_source_id",  limit: 4
    t.integer  "final_time",            limit: 4
    t.integer  "final_attempt",         limit: 4
    t.integer  "final_test_result",     limit: 4
    t.integer  "final_activity_id",     limit: 4
    t.integer  "final_level_source_id", limit: 4
    t.datetime "created_at",                        null: false
    t.datetime "updated_at",                        null: false
  end

  add_index "authored_hint_view_requests", ["level_id"], name: "fk_rails_8f51960e09", using: :btree
  add_index "authored_hint_view_requests", ["script_id", "level_id"], name: "index_authored_hint_view_requests_on_script_id_and_level_id", using: :btree
  add_index "authored_hint_view_requests", ["user_id", "script_id", "level_id", "hint_id"], name: "index_authored_hint_view_requests_on_all_related_ids", using: :btree
  add_index "authored_hint_view_requests", ["user_id"], name: "index_authored_hint_view_requests_on_user_id", using: :btree

  create_table "callouts", force: :cascade do |t|
    t.string   "element_id",       limit: 1024,  null: false
    t.string   "localization_key", limit: 1024,  null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "script_level_id",  limit: 4
    t.text     "qtip_config",      limit: 65535
    t.string   "on",               limit: 255
    t.string   "callout_text",     limit: 255
  end

  create_table "channel_tokens", force: :cascade do |t|
    t.string   "channel",    limit: 255, null: false
    t.integer  "user_id",    limit: 4,   null: false
    t.integer  "level_id",   limit: 4,   null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "channel_tokens", ["user_id", "level_id"], name: "index_channel_tokens_on_user_id_and_level_id", unique: true, using: :btree

  create_table "cohorts", force: :cascade do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "name",         limit: 255
    t.string   "program_type", limit: 255
    t.datetime "cutoff_date"
    t.integer  "script_id",    limit: 4
  end

  add_index "cohorts", ["name"], name: "index_cohorts_on_name", using: :btree
  add_index "cohorts", ["program_type"], name: "index_cohorts_on_program_type", using: :btree

  create_table "cohorts_deleted_users", id: false, force: :cascade do |t|
    t.integer "user_id",   limit: 4, null: false
    t.integer "cohort_id", limit: 4, null: false
  end

  add_index "cohorts_deleted_users", ["cohort_id", "user_id"], name: "index_cohorts_deleted_users_on_cohort_id_and_user_id", using: :btree
  add_index "cohorts_deleted_users", ["user_id", "cohort_id"], name: "index_cohorts_deleted_users_on_user_id_and_cohort_id", using: :btree

  create_table "cohorts_districts", force: :cascade do |t|
    t.integer "cohort_id",    limit: 4, null: false
    t.integer "district_id",  limit: 4, null: false
    t.integer "max_teachers", limit: 4
  end

  add_index "cohorts_districts", ["cohort_id", "district_id"], name: "index_cohorts_districts_on_cohort_id_and_district_id", using: :btree
  add_index "cohorts_districts", ["district_id", "cohort_id"], name: "index_cohorts_districts_on_district_id_and_cohort_id", using: :btree

  create_table "cohorts_users", id: false, force: :cascade do |t|
    t.integer "user_id",   limit: 4, null: false
    t.integer "cohort_id", limit: 4, null: false
  end

  add_index "cohorts_users", ["cohort_id", "user_id"], name: "index_cohorts_users_on_cohort_id_and_user_id", using: :btree
  add_index "cohorts_users", ["user_id", "cohort_id"], name: "index_cohorts_users_on_user_id_and_cohort_id", using: :btree

  create_table "concepts", force: :cascade do |t|
    t.string   "name",       limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "video_id",   limit: 4
  end

  add_index "concepts", ["video_id"], name: "index_concepts_on_video_id", using: :btree

  create_table "concepts_levels", force: :cascade do |t|
    t.integer "concept_id", limit: 4
    t.integer "level_id",   limit: 4
  end

  add_index "concepts_levels", ["concept_id"], name: "index_concepts_levels_on_concept_id", using: :btree
  add_index "concepts_levels", ["level_id"], name: "index_concepts_levels_on_level_id", using: :btree

  create_table "districts", force: :cascade do |t|
    t.string   "name",       limit: 255, null: false
    t.string   "location",   limit: 255
    t.integer  "contact_id", limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "districts", ["contact_id"], name: "index_districts_on_contact_id", using: :btree
  add_index "districts", ["name"], name: "index_districts_on_name", using: :btree

  create_table "districts_users", id: false, force: :cascade do |t|
    t.integer "user_id",     limit: 4, null: false
    t.integer "district_id", limit: 4, null: false
  end

  add_index "districts_users", ["district_id", "user_id"], name: "index_districts_users_on_district_id_and_user_id", using: :btree
  add_index "districts_users", ["user_id", "district_id"], name: "index_districts_users_on_user_id_and_district_id", using: :btree

  create_table "experiment_activities", force: :cascade do |t|
    t.integer  "activity_id",     limit: 4,   null: false
    t.string   "feedback_design", limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "facilitators_workshops", id: false, force: :cascade do |t|
    t.integer "workshop_id",    limit: 4, null: false
    t.integer "facilitator_id", limit: 4, null: false
  end

  create_table "followers", force: :cascade do |t|
    t.integer  "user_id",         limit: 4, null: false
    t.integer  "student_user_id", limit: 4, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "section_id",      limit: 4
    t.datetime "deleted_at"
  end

  add_index "followers", ["section_id"], name: "index_followers_on_section_id", using: :btree
  add_index "followers", ["student_user_id"], name: "index_followers_on_student_user_id", using: :btree
  add_index "followers", ["user_id", "student_user_id"], name: "index_followers_on_user_id_and_student_user_id", unique: true, using: :btree

  create_table "frequent_unsuccessful_level_sources", force: :cascade do |t|
    t.integer  "level_source_id", limit: 4,                 null: false
    t.boolean  "active",                    default: false, null: false
    t.integer  "level_id",        limit: 4,                 null: false
    t.integer  "num_of_attempts", limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "gallery_activities", force: :cascade do |t|
    t.integer  "user_id",     limit: 4,                      null: false
    t.integer  "activity_id", limit: 4,                      null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "autosaved"
    t.string   "app",         limit: 255, default: "turtle", null: false
  end

  add_index "gallery_activities", ["activity_id"], name: "index_gallery_activities_on_activity_id", using: :btree
  add_index "gallery_activities", ["app", "autosaved"], name: "index_gallery_activities_on_app_and_autosaved", using: :btree
  add_index "gallery_activities", ["user_id", "activity_id"], name: "index_gallery_activities_on_user_id_and_activity_id", unique: true, using: :btree

  create_table "games", force: :cascade do |t|
    t.string   "name",           limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "app",            limit: 255
    t.integer  "intro_video_id", limit: 4
  end

  add_index "games", ["intro_video_id"], name: "index_games_on_intro_video_id", using: :btree

  create_table "hint_view_requests", force: :cascade do |t|
    t.integer  "user_id",       limit: 4
    t.integer  "script_id",     limit: 4
    t.integer  "level_id",      limit: 4
    t.integer  "feedback_type", limit: 4
    t.text     "feedback_xml",  limit: 65535
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
  end

  add_index "hint_view_requests", ["script_id", "level_id"], name: "index_hint_view_requests_on_script_id_and_level_id", using: :btree
  add_index "hint_view_requests", ["user_id"], name: "index_hint_view_requests_on_user_id", using: :btree

  create_table "level_concept_difficulties", force: :cascade do |t|
    t.integer  "level_id",              limit: 4
    t.datetime "created_at",                      null: false
    t.datetime "updated_at",                      null: false
    t.integer  "sequencing",            limit: 4
    t.integer  "debugging",             limit: 4
    t.integer  "repeat_loops",          limit: 4
    t.integer  "repeat_until_while",    limit: 4
    t.integer  "for_loops",             limit: 4
    t.integer  "events",                limit: 4
    t.integer  "variables",             limit: 4
    t.integer  "functions",             limit: 4
    t.integer  "functions_with_params", limit: 4
    t.integer  "conditionals",          limit: 4
  end

  add_index "level_concept_difficulties", ["level_id"], name: "index_level_concept_difficulties_on_level_id", using: :btree

  create_table "level_source_hints", force: :cascade do |t|
    t.integer  "level_source_id", limit: 4
    t.text     "hint",            limit: 65535
    t.integer  "times_proposed",  limit: 4
    t.float    "priority",        limit: 24
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "user_id",         limit: 4
    t.string   "status",          limit: 255
    t.string   "source",          limit: 255
  end

  add_index "level_source_hints", ["level_source_id"], name: "index_level_source_hints_on_level_source_id", using: :btree

  create_table "level_source_images", force: :cascade do |t|
    t.integer  "level_source_id", limit: 4
    t.binary   "image",           limit: 16777215
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "level_source_images", ["level_source_id"], name: "index_level_source_images_on_level_source_id", using: :btree

  create_table "level_sources", force: :cascade do |t|
    t.integer  "level_id",   limit: 4
    t.string   "md5",        limit: 32,                    null: false
    t.string   "data",       limit: 20000,                 null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "hidden",                   default: false
  end

  add_index "level_sources", ["level_id", "md5"], name: "index_level_sources_on_level_id_and_md5", using: :btree

  create_table "levels", force: :cascade do |t|
    t.integer  "game_id",                  limit: 4
    t.string   "name",                     limit: 255,                   null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "level_num",                limit: 255
    t.integer  "ideal_level_source_id",    limit: 4
    t.integer  "solution_level_source_id", limit: 4
    t.integer  "user_id",                  limit: 4
    t.text     "properties",               limit: 65535
    t.string   "type",                     limit: 255
    t.string   "md5",                      limit: 255
    t.boolean  "published",                              default: false, null: false
    t.text     "notes",                    limit: 65535
  end

  add_index "levels", ["game_id"], name: "index_levels_on_game_id", using: :btree

  create_table "levels_script_levels", id: false, force: :cascade do |t|
    t.integer "level_id",        limit: 4, null: false
    t.integer "script_level_id", limit: 4, null: false
  end

  add_index "levels_script_levels", ["level_id"], name: "index_levels_script_levels_on_level_id", using: :btree
  add_index "levels_script_levels", ["script_level_id"], name: "index_levels_script_levels_on_script_level_id", using: :btree

  create_table "pd_attendances", force: :cascade do |t|
    t.integer  "pd_session_id", limit: 4, null: false
    t.integer  "teacher_id",    limit: 4, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "pd_attendances", ["pd_session_id"], name: "index_pd_attendances_on_pd_session_id", using: :btree

  create_table "pd_district_payment_terms", force: :cascade do |t|
    t.integer "district_id", limit: 4
    t.string  "course",      limit: 255,                         null: false
    t.string  "rate_type",   limit: 255,                         null: false
    t.decimal "rate",                    precision: 8, scale: 2, null: false
  end

  add_index "pd_district_payment_terms", ["district_id", "course"], name: "index_pd_district_payment_terms_on_district_id_and_course", using: :btree

  create_table "pd_enrollments", force: :cascade do |t|
    t.integer  "pd_workshop_id", limit: 4,   null: false
    t.string   "name",           limit: 255, null: false
    t.string   "email",          limit: 255, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "pd_enrollments", ["pd_workshop_id"], name: "index_pd_enrollments_on_pd_workshop_id", using: :btree

  create_table "pd_sessions", force: :cascade do |t|
    t.integer  "pd_workshop_id", limit: 4
    t.datetime "start",                    null: false
    t.datetime "end",                      null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "pd_sessions", ["pd_workshop_id"], name: "index_pd_sessions_on_pd_workshop_id", using: :btree

  create_table "pd_workshops", force: :cascade do |t|
    t.string   "workshop_type",    limit: 255, null: false
    t.integer  "organizer_id",     limit: 4,   null: false
    t.string   "location_name",    limit: 255
    t.string   "location_address", limit: 255
    t.string   "course",           limit: 255, null: false
    t.string   "subject",          limit: 255
    t.integer  "capacity",         limit: 4,   null: false
    t.string   "notes",            limit: 255
    t.integer  "section_id",       limit: 4
    t.datetime "started_at"
    t.datetime "ended_at"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "pd_workshops", ["organizer_id"], name: "index_pd_workshops_on_organizer_id", using: :btree

  create_table "pd_workshops_facilitators", id: false, force: :cascade do |t|
    t.integer "pd_workshop_id", limit: 4, null: false
    t.integer "user_id",        limit: 4, null: false
  end

  add_index "pd_workshops_facilitators", ["pd_workshop_id"], name: "index_pd_workshops_facilitators_on_pd_workshop_id", using: :btree
  add_index "pd_workshops_facilitators", ["user_id"], name: "index_pd_workshops_facilitators_on_user_id", using: :btree

  create_table "plc_course_units", force: :cascade do |t|
    t.integer  "plc_course_id",    limit: 4
    t.string   "unit_name",        limit: 255
    t.string   "unit_description", limit: 255
    t.integer  "unit_order",       limit: 4
    t.datetime "created_at",                   null: false
    t.datetime "updated_at",                   null: false
  end

  add_index "plc_course_units", ["plc_course_id"], name: "index_plc_course_units_on_plc_course_id", using: :btree

  create_table "plc_courses", force: :cascade do |t|
    t.string   "name",       limit: 255
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
  end

  create_table "plc_enrollment_module_assignments", force: :cascade do |t|
    t.integer  "plc_enrollment_unit_assignment_id", limit: 4
    t.integer  "plc_learning_module_id",            limit: 4
    t.datetime "created_at",                                  null: false
    t.datetime "updated_at",                                  null: false
  end

  add_index "plc_enrollment_module_assignments", ["plc_enrollment_unit_assignment_id"], name: "module_assignment_enrollment_index", using: :btree
  add_index "plc_enrollment_module_assignments", ["plc_learning_module_id"], name: "module_assignment_lm_index", using: :btree

  create_table "plc_enrollment_task_assignments", force: :cascade do |t|
    t.string   "status",                              limit: 255
    t.integer  "plc_enrollment_module_assignment_id", limit: 4
    t.integer  "plc_task_id",                         limit: 4
    t.datetime "created_at",                                        null: false
    t.datetime "updated_at",                                        null: false
    t.string   "type",                                limit: 255
    t.text     "properties",                          limit: 65535
  end

  add_index "plc_enrollment_task_assignments", ["plc_enrollment_module_assignment_id"], name: "task_assignment_module_assignment_index", using: :btree
  add_index "plc_enrollment_task_assignments", ["plc_task_id"], name: "task_assignment_task_index", using: :btree

  create_table "plc_enrollment_unit_assignments", force: :cascade do |t|
    t.integer  "plc_user_course_enrollment_id", limit: 4
    t.integer  "plc_course_unit_id",            limit: 4
    t.string   "status",                        limit: 255
    t.datetime "created_at",                                null: false
    t.datetime "updated_at",                                null: false
  end

  add_index "plc_enrollment_unit_assignments", ["plc_course_unit_id"], name: "enrollment_unit_assignment_course_unit_index", using: :btree
  add_index "plc_enrollment_unit_assignments", ["plc_user_course_enrollment_id"], name: "enrollment_unit_assignment_course_enrollment_index", using: :btree

  create_table "plc_evaluation_answers", force: :cascade do |t|
    t.string   "answer",                     limit: 255
    t.integer  "plc_evaluation_question_id", limit: 4
    t.datetime "created_at",                             null: false
    t.datetime "updated_at",                             null: false
    t.integer  "plc_learning_module_id",     limit: 4
  end

  add_index "plc_evaluation_answers", ["plc_evaluation_question_id"], name: "index_plc_evaluation_answers_on_plc_evaluation_question_id", using: :btree
  add_index "plc_evaluation_answers", ["plc_learning_module_id"], name: "index_plc_evaluation_answers_on_plc_learning_module_id", using: :btree

  create_table "plc_evaluation_questions", force: :cascade do |t|
    t.string   "question",           limit: 255
    t.integer  "plc_course_unit_id", limit: 4
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
  end

  add_index "plc_evaluation_questions", ["plc_course_unit_id"], name: "index_plc_evaluation_questions_on_plc_course_unit_id", using: :btree

  create_table "plc_learning_modules", force: :cascade do |t|
    t.string   "name",               limit: 255
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
    t.integer  "plc_course_unit_id", limit: 4,   null: false
    t.string   "module_type",        limit: 255
  end

  add_index "plc_learning_modules", ["plc_course_unit_id"], name: "index_plc_learning_modules_on_plc_course_unit_id", using: :btree

  create_table "plc_learning_modules_tasks", id: false, force: :cascade do |t|
    t.integer "plc_learning_module_id", limit: 4, null: false
    t.integer "plc_task_id",            limit: 4, null: false
  end

  add_index "plc_learning_modules_tasks", ["plc_learning_module_id"], name: "index_plc_learning_modules_tasks_on_plc_learning_module_id", using: :btree
  add_index "plc_learning_modules_tasks", ["plc_task_id"], name: "index_plc_learning_modules_tasks_on_plc_task_id", using: :btree

  create_table "plc_tasks", force: :cascade do |t|
    t.string   "name",       limit: 255
    t.datetime "created_at",                                     null: false
    t.datetime "updated_at",                                     null: false
    t.string   "type",       limit: 255,   default: "Plc::Task", null: false
    t.text     "properties", limit: 65535
  end

  create_table "plc_user_course_enrollments", force: :cascade do |t|
    t.string   "status",        limit: 255
    t.integer  "plc_course_id", limit: 4
    t.integer  "user_id",       limit: 4
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
  end

  add_index "plc_user_course_enrollments", ["plc_course_id"], name: "index_plc_user_course_enrollments_on_plc_course_id", using: :btree
  add_index "plc_user_course_enrollments", ["user_id", "plc_course_id"], name: "index_plc_user_course_enrollments_on_user_id_and_plc_course_id", unique: true, using: :btree

  create_table "prize_providers", force: :cascade do |t|
    t.string   "name",              limit: 255
    t.string   "url",               limit: 255
    t.string   "description_token", limit: 255
    t.string   "image_name",        limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "prizes", force: :cascade do |t|
    t.integer  "prize_provider_id", limit: 4,   null: false
    t.string   "code",              limit: 255, null: false
    t.integer  "user_id",           limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "prizes", ["prize_provider_id"], name: "index_prizes_on_prize_provider_id", using: :btree
  add_index "prizes", ["user_id"], name: "index_prizes_on_user_id", using: :btree

  create_table "puzzle_ratings", force: :cascade do |t|
    t.integer  "user_id",    limit: 4
    t.integer  "script_id",  limit: 4
    t.integer  "level_id",   limit: 4
    t.integer  "rating",     limit: 4
    t.datetime "created_at",           null: false
    t.datetime "updated_at",           null: false
  end

  add_index "puzzle_ratings", ["script_id", "level_id"], name: "index_puzzle_ratings_on_script_id_and_level_id", using: :btree
  add_index "puzzle_ratings", ["user_id", "script_id", "level_id"], name: "index_puzzle_ratings_on_user_id_and_script_id_and_level_id", unique: true, using: :btree

  create_table "script_levels", force: :cascade do |t|
    t.integer  "script_id",  limit: 4, null: false
    t.integer  "chapter",    limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "stage_id",   limit: 4
    t.integer  "position",   limit: 4
    t.boolean  "assessment"
    t.integer  "level_id",   limit: 4
  end

  add_index "script_levels", ["level_id"], name: "index_script_levels_on_level_id", using: :btree
  add_index "script_levels", ["script_id"], name: "index_script_levels_on_script_id", using: :btree
  add_index "script_levels", ["stage_id"], name: "index_script_levels_on_stage_id", using: :btree

  create_table "scripts", force: :cascade do |t|
    t.string   "name",            limit: 255,                   null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "wrapup_video_id", limit: 4
    t.boolean  "trophies",                      default: false, null: false
    t.boolean  "hidden",                        default: false, null: false
    t.integer  "user_id",         limit: 4
    t.boolean  "login_required",                default: false, null: false
    t.text     "properties",      limit: 65535
  end

  add_index "scripts", ["name"], name: "index_scripts_on_name", unique: true, using: :btree
  add_index "scripts", ["wrapup_video_id"], name: "index_scripts_on_wrapup_video_id", using: :btree

  create_table "secret_pictures", force: :cascade do |t|
    t.string   "name",       limit: 255, null: false
    t.string   "path",       limit: 255, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "secret_pictures", ["name"], name: "index_secret_pictures_on_name", unique: true, using: :btree
  add_index "secret_pictures", ["path"], name: "index_secret_pictures_on_path", unique: true, using: :btree

  create_table "secret_words", force: :cascade do |t|
    t.string   "word",       limit: 255, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "secret_words", ["word"], name: "index_secret_words_on_word", unique: true, using: :btree

  create_table "sections", force: :cascade do |t|
    t.integer  "user_id",    limit: 4,                     null: false
    t.string   "name",       limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "code",       limit: 255
    t.integer  "script_id",  limit: 4
    t.string   "grade",      limit: 255
    t.string   "admin_code", limit: 255
    t.string   "login_type", limit: 255, default: "email", null: false
    t.datetime "deleted_at"
  end

  add_index "sections", ["code"], name: "index_sections_on_code", unique: true, using: :btree
  add_index "sections", ["user_id"], name: "index_sections_on_user_id", using: :btree

  create_table "segments", force: :cascade do |t|
    t.integer  "workshop_id", limit: 4, null: false
    t.datetime "start",                 null: false
    t.datetime "end"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "segments", ["end"], name: "index_segments_on_end", using: :btree
  add_index "segments", ["start"], name: "index_segments_on_start", using: :btree
  add_index "segments", ["workshop_id"], name: "index_segments_on_workshop_id", using: :btree

  create_table "stages", force: :cascade do |t|
    t.string   "name",       limit: 255, null: false
    t.integer  "position",   limit: 4
    t.integer  "script_id",  limit: 4,   null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "survey_results", force: :cascade do |t|
    t.integer  "user_id",    limit: 4
    t.text     "properties", limit: 65535
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
  end

  add_index "survey_results", ["user_id"], name: "index_survey_results_on_user_id", using: :btree

  create_table "teacher_bonus_prizes", force: :cascade do |t|
    t.integer  "prize_provider_id", limit: 4,   null: false
    t.string   "code",              limit: 255, null: false
    t.integer  "user_id",           limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "teacher_bonus_prizes", ["prize_provider_id"], name: "index_teacher_bonus_prizes_on_prize_provider_id", using: :btree
  add_index "teacher_bonus_prizes", ["user_id"], name: "index_teacher_bonus_prizes_on_user_id", using: :btree

  create_table "teacher_prizes", force: :cascade do |t|
    t.integer  "prize_provider_id", limit: 4,   null: false
    t.string   "code",              limit: 255, null: false
    t.integer  "user_id",           limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "teacher_prizes", ["prize_provider_id"], name: "index_teacher_prizes_on_prize_provider_id", using: :btree
  add_index "teacher_prizes", ["user_id"], name: "index_teacher_prizes_on_user_id", using: :btree

  create_table "trophies", force: :cascade do |t|
    t.string   "name",       limit: 255
    t.string   "image_name", limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "trophies", ["name"], name: "index_trophies_on_name", unique: true, using: :btree

  create_table "unexpected_teachers_workshops", id: false, force: :cascade do |t|
    t.integer "workshop_id",           limit: 4, null: false
    t.integer "unexpected_teacher_id", limit: 4, null: false
  end

  add_index "unexpected_teachers_workshops", ["unexpected_teacher_id"], name: "index_unexpected_teachers_workshops_on_unexpected_teacher_id", using: :btree
  add_index "unexpected_teachers_workshops", ["workshop_id"], name: "index_unexpected_teachers_workshops_on_workshop_id", using: :btree

  create_table "user_levels", force: :cascade do |t|
    t.integer  "user_id",         limit: 4,             null: false
    t.integer  "level_id",        limit: 4,             null: false
    t.integer  "attempts",        limit: 4, default: 0, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "best_result",     limit: 4
    t.integer  "script_id",       limit: 4
    t.integer  "level_source_id", limit: 4
    t.boolean  "submitted"
  end

  add_index "user_levels", ["user_id", "level_id", "script_id"], name: "index_user_levels_on_user_id_and_level_id_and_script_id", unique: true, using: :btree

  create_table "user_module_task_assignments", force: :cascade do |t|
    t.integer "user_enrollment_module_assignment_id", limit: 4
    t.integer "professional_learning_task_id",        limit: 4
    t.string  "status",                               limit: 255
  end

  add_index "user_module_task_assignments", ["professional_learning_task_id"], name: "task_assignment_to_task_index", using: :btree
  add_index "user_module_task_assignments", ["user_enrollment_module_assignment_id"], name: "task_assignment_to_module_assignment_index", using: :btree

  create_table "user_permissions", force: :cascade do |t|
    t.integer  "user_id",    limit: 4,   null: false
    t.string   "permission", limit: 255, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "user_permissions", ["user_id", "permission"], name: "index_user_permissions_on_user_id_and_permission", unique: true, using: :btree

  create_table "user_proficiencies", force: :cascade do |t|
    t.integer  "user_id",                        limit: 4,             null: false
    t.datetime "created_at",                                           null: false
    t.datetime "updated_at",                                           null: false
    t.datetime "last_progress_at"
    t.integer  "sequencing_d1_count",            limit: 4, default: 0
    t.integer  "sequencing_d2_count",            limit: 4, default: 0
    t.integer  "sequencing_d3_count",            limit: 4, default: 0
    t.integer  "sequencing_d4_count",            limit: 4, default: 0
    t.integer  "sequencing_d5_count",            limit: 4, default: 0
    t.integer  "debugging_d1_count",             limit: 4, default: 0
    t.integer  "debugging_d2_count",             limit: 4, default: 0
    t.integer  "debugging_d3_count",             limit: 4, default: 0
    t.integer  "debugging_d4_count",             limit: 4, default: 0
    t.integer  "debugging_d5_count",             limit: 4, default: 0
    t.integer  "repeat_loops_d1_count",          limit: 4, default: 0
    t.integer  "repeat_loops_d2_count",          limit: 4, default: 0
    t.integer  "repeat_loops_d3_count",          limit: 4, default: 0
    t.integer  "repeat_loops_d4_count",          limit: 4, default: 0
    t.integer  "repeat_loops_d5_count",          limit: 4, default: 0
    t.integer  "repeat_until_while_d1_count",    limit: 4, default: 0
    t.integer  "repeat_until_while_d2_count",    limit: 4, default: 0
    t.integer  "repeat_until_while_d3_count",    limit: 4, default: 0
    t.integer  "repeat_until_while_d4_count",    limit: 4, default: 0
    t.integer  "repeat_until_while_d5_count",    limit: 4, default: 0
    t.integer  "for_loops_d1_count",             limit: 4, default: 0
    t.integer  "for_loops_d2_count",             limit: 4, default: 0
    t.integer  "for_loops_d3_count",             limit: 4, default: 0
    t.integer  "for_loops_d4_count",             limit: 4, default: 0
    t.integer  "for_loops_d5_count",             limit: 4, default: 0
    t.integer  "events_d1_count",                limit: 4, default: 0
    t.integer  "events_d2_count",                limit: 4, default: 0
    t.integer  "events_d3_count",                limit: 4, default: 0
    t.integer  "events_d4_count",                limit: 4, default: 0
    t.integer  "events_d5_count",                limit: 4, default: 0
    t.integer  "variables_d1_count",             limit: 4, default: 0
    t.integer  "variables_d2_count",             limit: 4, default: 0
    t.integer  "variables_d3_count",             limit: 4, default: 0
    t.integer  "variables_d4_count",             limit: 4, default: 0
    t.integer  "variables_d5_count",             limit: 4, default: 0
    t.integer  "functions_d1_count",             limit: 4, default: 0
    t.integer  "functions_d2_count",             limit: 4, default: 0
    t.integer  "functions_d3_count",             limit: 4, default: 0
    t.integer  "functions_d4_count",             limit: 4, default: 0
    t.integer  "functions_d5_count",             limit: 4, default: 0
    t.integer  "functions_with_params_d1_count", limit: 4, default: 0
    t.integer  "functions_with_params_d2_count", limit: 4, default: 0
    t.integer  "functions_with_params_d3_count", limit: 4, default: 0
    t.integer  "functions_with_params_d4_count", limit: 4, default: 0
    t.integer  "functions_with_params_d5_count", limit: 4, default: 0
    t.integer  "conditionals_d1_count",          limit: 4, default: 0
    t.integer  "conditionals_d2_count",          limit: 4, default: 0
    t.integer  "conditionals_d3_count",          limit: 4, default: 0
    t.integer  "conditionals_d4_count",          limit: 4, default: 0
    t.integer  "conditionals_d5_count",          limit: 4, default: 0
    t.datetime "basic_proficiency_at"
  end

  add_index "user_proficiencies", ["user_id"], name: "index_user_proficiencies_on_user_id", using: :btree

  create_table "user_scripts", force: :cascade do |t|
    t.integer  "user_id",          limit: 4, null: false
    t.integer  "script_id",        limit: 4, null: false
    t.datetime "started_at"
    t.datetime "completed_at"
    t.datetime "assigned_at"
    t.datetime "last_progress_at"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "user_scripts", ["script_id"], name: "index_user_scripts_on_script_id", using: :btree
  add_index "user_scripts", ["user_id", "script_id"], name: "index_user_scripts_on_user_id_and_script_id", unique: true, using: :btree

  create_table "user_trophies", force: :cascade do |t|
    t.integer  "user_id",    limit: 4, null: false
    t.integer  "trophy_id",  limit: 4, null: false
    t.integer  "concept_id", limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "user_trophies", ["user_id", "trophy_id", "concept_id"], name: "index_user_trophies_on_user_id_and_trophy_id_and_concept_id", unique: true, using: :btree

  create_table "users", force: :cascade do |t|
    t.string   "email",                      limit: 255,   default: "",      null: false
    t.string   "encrypted_password",         limit: 255,   default: ""
    t.string   "reset_password_token",       limit: 255
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",              limit: 4,     default: 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip",         limit: 255
    t.string   "last_sign_in_ip",            limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "username",                   limit: 255
    t.string   "provider",                   limit: 255
    t.string   "uid",                        limit: 255
    t.boolean  "admin"
    t.string   "gender",                     limit: 1
    t.string   "name",                       limit: 255
    t.string   "locale",                     limit: 10,    default: "en-US", null: false
    t.date     "birthday"
    t.string   "parent_email",               limit: 255
    t.string   "user_type",                  limit: 16
    t.string   "school",                     limit: 255
    t.string   "full_address",               limit: 1024
    t.integer  "total_lines",                limit: 4,     default: 0,       null: false
    t.boolean  "prize_earned",                             default: false
    t.integer  "prize_id",                   limit: 4
    t.boolean  "teacher_prize_earned",                     default: false
    t.integer  "teacher_prize_id",           limit: 4
    t.boolean  "teacher_bonus_prize_earned",               default: false
    t.integer  "teacher_bonus_prize_id",     limit: 4
    t.string   "confirmation_token",         limit: 255
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email",          limit: 255
    t.integer  "prize_teacher_id",           limit: 4
    t.boolean  "hint_access"
    t.integer  "secret_picture_id",          limit: 4
    t.boolean  "active",                                   default: true,    null: false
    t.string   "hashed_email",               limit: 255
    t.datetime "deleted_at"
    t.string   "secret_words",               limit: 255
    t.text     "properties",                 limit: 65535
    t.string   "invitation_token",           limit: 255
    t.datetime "invitation_created_at"
    t.datetime "invitation_sent_at"
    t.datetime "invitation_accepted_at"
    t.integer  "invitation_limit",           limit: 4
    t.integer  "invited_by_id",              limit: 4
    t.string   "invited_by_type",            limit: 255
    t.integer  "invitations_count",          limit: 4,     default: 0
  end

  add_index "users", ["confirmation_token", "deleted_at"], name: "index_users_on_confirmation_token_and_deleted_at", unique: true, using: :btree
  add_index "users", ["email", "deleted_at"], name: "index_users_on_email_and_deleted_at", using: :btree
  add_index "users", ["hashed_email", "deleted_at"], name: "index_users_on_hashed_email_and_deleted_at", using: :btree
  add_index "users", ["invitation_token"], name: "index_users_on_invitation_token", unique: true, using: :btree
  add_index "users", ["invitations_count"], name: "index_users_on_invitations_count", using: :btree
  add_index "users", ["invited_by_id"], name: "index_users_on_invited_by_id", using: :btree
  add_index "users", ["prize_id", "deleted_at"], name: "index_users_on_prize_id_and_deleted_at", unique: true, using: :btree
  add_index "users", ["provider", "uid", "deleted_at"], name: "index_users_on_provider_and_uid_and_deleted_at", unique: true, using: :btree
  add_index "users", ["reset_password_token", "deleted_at"], name: "index_users_on_reset_password_token_and_deleted_at", unique: true, using: :btree
  add_index "users", ["teacher_bonus_prize_id", "deleted_at"], name: "index_users_on_teacher_bonus_prize_id_and_deleted_at", unique: true, using: :btree
  add_index "users", ["teacher_prize_id", "deleted_at"], name: "index_users_on_teacher_prize_id_and_deleted_at", unique: true, using: :btree
  add_index "users", ["unconfirmed_email", "deleted_at"], name: "index_users_on_unconfirmed_email_and_deleted_at", using: :btree
  add_index "users", ["username", "deleted_at"], name: "index_users_on_username_and_deleted_at", unique: true, using: :btree

  create_table "videos", force: :cascade do |t|
    t.string   "key",          limit: 255
    t.string   "youtube_code", limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "download",     limit: 255
  end

  create_table "workshop_attendance", force: :cascade do |t|
    t.integer  "teacher_id", limit: 4,     null: false
    t.integer  "segment_id", limit: 4,     null: false
    t.string   "status",     limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "notes",      limit: 65535
  end

  add_index "workshop_attendance", ["segment_id"], name: "index_workshop_attendance_on_segment_id", using: :btree
  add_index "workshop_attendance", ["teacher_id"], name: "index_workshop_attendance_on_teacher_id", using: :btree

  create_table "workshop_cohorts", force: :cascade do |t|
    t.integer  "workshop_id", limit: 4, null: false
    t.integer  "cohort_id",   limit: 4, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "workshops", force: :cascade do |t|
    t.string   "name",         limit: 255
    t.string   "program_type", limit: 255,  null: false
    t.string   "location",     limit: 1000
    t.string   "instructions", limit: 1000
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "phase",        limit: 4
  end

  add_index "workshops", ["name"], name: "index_workshops_on_name", using: :btree
  add_index "workshops", ["program_type"], name: "index_workshops_on_program_type", using: :btree

  add_foreign_key "authored_hint_view_requests", "levels"
  add_foreign_key "authored_hint_view_requests", "scripts"
  add_foreign_key "authored_hint_view_requests", "users"
  add_foreign_key "hint_view_requests", "users"
  add_foreign_key "level_concept_difficulties", "levels"
  add_foreign_key "survey_results", "users"
  add_foreign_key "user_proficiencies", "users"
end
