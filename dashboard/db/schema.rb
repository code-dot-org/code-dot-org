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

ActiveRecord::Schema.define(version: 20150804213021) do

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
    t.string   "name",                     limit: 255,   null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "level_num",                limit: 255
    t.integer  "ideal_level_source_id",    limit: 4
    t.integer  "solution_level_source_id", limit: 4
    t.integer  "user_id",                  limit: 4
    t.text     "properties",               limit: 65535
    t.string   "type",                     limit: 255
    t.string   "md5",                      limit: 255
  end

  add_index "levels", ["game_id"], name: "index_levels_on_game_id", using: :btree

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

  create_table "script_levels", force: :cascade do |t|
    t.integer  "level_id",   limit: 4, null: false
    t.integer  "script_id",  limit: 4, null: false
    t.integer  "chapter",    limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "stage_id",   limit: 4
    t.integer  "position",   limit: 4
    t.boolean  "assessment"
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

