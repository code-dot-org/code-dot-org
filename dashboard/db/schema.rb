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

ActiveRecord::Schema.define(version: 20160503010123) do

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

