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

ActiveRecord::Schema.define(version: 20141017233919) do

  create_table "activities", force: true do |t|
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
  end

  add_index "activities", ["level_source_id"], name: "index_activities_on_level_source_id", using: :btree
  add_index "activities", ["user_id", "level_id"], name: "index_activities_on_user_id_and_level_id", using: :btree

  create_table "activity_hints", force: true do |t|
    t.integer  "activity_id",          null: false
    t.integer  "level_source_hint_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "hint_visibility"
    t.integer  "ip_hash"
  end

  add_index "activity_hints", ["activity_id"], name: "index_activity_hints_on_activity_id", using: :btree
  add_index "activity_hints", ["level_source_hint_id"], name: "index_activity_hints_on_level_source_hint_id", using: :btree

  create_table "callouts", force: true do |t|
    t.string   "element_id",       limit: 1024, null: false
    t.string   "localization_key", limit: 1024, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "script_level_id"
    t.text     "qtip_config"
  end

  create_table "concepts", force: true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "video_id"
  end

  add_index "concepts", ["video_id"], name: "index_concepts_on_video_id", using: :btree

  create_table "concepts_levels", force: true do |t|
    t.integer "concept_id"
    t.integer "level_id"
  end

  add_index "concepts_levels", ["concept_id"], name: "index_concepts_levels_on_concept_id", using: :btree
  add_index "concepts_levels", ["level_id"], name: "index_concepts_levels_on_level_id", using: :btree

  create_table "experiment_activities", force: true do |t|
    t.integer  "activity_id",     null: false
    t.string   "feedback_design"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "followers", force: true do |t|
    t.integer  "user_id",         null: false
    t.integer  "student_user_id", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "section_id"
  end

  add_index "followers", ["section_id"], name: "index_followers_on_section_id", using: :btree
  add_index "followers", ["student_user_id"], name: "index_followers_on_student_user_id", using: :btree
  add_index "followers", ["user_id", "student_user_id"], name: "index_followers_on_user_id_and_student_user_id", unique: true, using: :btree

  create_table "frequent_unsuccessful_level_sources", force: true do |t|
    t.integer  "level_source_id",                 null: false
    t.boolean  "active",          default: false, null: false
    t.integer  "level_id",                        null: false
    t.integer  "num_of_attempts"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "gallery_activities", force: true do |t|
    t.integer  "user_id",                        null: false
    t.integer  "activity_id",                    null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "autosaved"
    t.string   "app",         default: "turtle", null: false
  end

  add_index "gallery_activities", ["app", "autosaved"], name: "index_gallery_activities_on_app_and_autosaved", using: :btree
  add_index "gallery_activities", ["user_id", "activity_id"], name: "index_gallery_activities_on_user_id_and_activity_id", unique: true, using: :btree

  create_table "games", force: true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "app"
    t.integer  "intro_video_id"
  end

  add_index "games", ["intro_video_id"], name: "index_games_on_intro_video_id", using: :btree

  create_table "level_source_hints", force: true do |t|
    t.integer  "level_source_id"
    t.text     "hint"
    t.integer  "times_proposed"
    t.float    "priority"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "user_id"
    t.string   "status"
    t.string   "source"
  end

  add_index "level_source_hints", ["level_source_id"], name: "index_level_source_hints_on_level_source_id", using: :btree

  create_table "level_source_images", force: true do |t|
    t.integer  "level_source_id"
    t.binary   "image",           limit: 16777215
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "level_source_images", ["level_source_id"], name: "index_level_source_images_on_level_source_id", using: :btree

  create_table "level_sources", force: true do |t|
    t.integer  "level_id"
    t.string   "md5",        limit: 32,    null: false
    t.string   "data",       limit: 20000, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "level_sources", ["level_id", "md5"], name: "index_level_sources_on_level_id_and_md5", using: :btree

  create_table "levels", force: true do |t|
    t.integer  "game_id"
    t.string   "name",                     null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "level_num"
    t.integer  "ideal_level_source_id"
    t.integer  "solution_level_source_id"
    t.integer  "user_id"
    t.text     "properties"
    t.string   "type"
  end

  add_index "levels", ["game_id"], name: "index_levels_on_game_id", using: :btree

  create_table "prize_providers", force: true do |t|
    t.string   "name"
    t.string   "url"
    t.string   "description_token"
    t.string   "image_name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "prizes", force: true do |t|
    t.integer  "prize_provider_id", null: false
    t.string   "code",              null: false
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "prizes", ["prize_provider_id"], name: "index_prizes_on_prize_provider_id", using: :btree
  add_index "prizes", ["user_id"], name: "index_prizes_on_user_id", using: :btree

  create_table "script_levels", force: true do |t|
    t.integer  "level_id",     null: false
    t.integer  "script_id",    null: false
    t.integer  "chapter"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "game_chapter"
    t.integer  "stage_id"
    t.integer  "position"
    t.boolean  "assessment"
  end

  add_index "script_levels", ["level_id"], name: "index_script_levels_on_level_id", using: :btree
  add_index "script_levels", ["script_id"], name: "index_script_levels_on_script_id", using: :btree
  add_index "script_levels", ["stage_id"], name: "index_script_levels_on_stage_id", using: :btree

  create_table "scripts", force: true do |t|
    t.string   "name",                            null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "wrapup_video_id"
    t.boolean  "trophies",        default: false, null: false
    t.boolean  "hidden",          default: false, null: false
    t.integer  "user_id"
  end

  add_index "scripts", ["name"], name: "index_scripts_on_name", unique: true, using: :btree
  add_index "scripts", ["wrapup_video_id"], name: "index_scripts_on_wrapup_video_id", using: :btree

  create_table "secret_pictures", force: true do |t|
    t.string   "name",       null: false
    t.string   "path",       null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "secret_pictures", ["name"], name: "index_secret_pictures_on_name", unique: true, using: :btree
  add_index "secret_pictures", ["path"], name: "index_secret_pictures_on_path", unique: true, using: :btree

  create_table "secret_words", force: true do |t|
    t.string   "word",       null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "secret_words", ["word"], name: "index_secret_words_on_word", unique: true, using: :btree

  create_table "sections", force: true do |t|
    t.integer  "user_id",                      null: false
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "code"
    t.integer  "script_id"
    t.string   "grade"
    t.string   "admin_code"
    t.string   "login_type", default: "email", null: false
  end

  add_index "sections", ["code"], name: "index_sections_on_code", unique: true, using: :btree
  add_index "sections", ["user_id"], name: "index_sections_on_user_id", using: :btree

  create_table "stages", force: true do |t|
    t.string   "name",       null: false
    t.integer  "position"
    t.integer  "script_id",  null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "teacher_bonus_prizes", force: true do |t|
    t.integer  "prize_provider_id", null: false
    t.string   "code",              null: false
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "teacher_bonus_prizes", ["prize_provider_id"], name: "index_teacher_bonus_prizes_on_prize_provider_id", using: :btree
  add_index "teacher_bonus_prizes", ["user_id"], name: "index_teacher_bonus_prizes_on_user_id", using: :btree

  create_table "teacher_prizes", force: true do |t|
    t.integer  "prize_provider_id", null: false
    t.string   "code",              null: false
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "teacher_prizes", ["prize_provider_id"], name: "index_teacher_prizes_on_prize_provider_id", using: :btree
  add_index "teacher_prizes", ["user_id"], name: "index_teacher_prizes_on_user_id", using: :btree

  create_table "trophies", force: true do |t|
    t.string   "name"
    t.string   "image_name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "trophies", ["name"], name: "index_trophies_on_name", unique: true, using: :btree

  create_table "user_levels", force: true do |t|
    t.integer  "user_id",                 null: false
    t.integer  "level_id",                null: false
    t.integer  "attempts",    default: 0, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "best_result"
  end

  add_index "user_levels", ["user_id", "level_id"], name: "index_user_levels_on_user_id_and_level_id", unique: true, using: :btree

  create_table "user_permissions", force: true do |t|
    t.integer  "user_id",    null: false
    t.string   "permission", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "user_permissions", ["user_id", "permission"], name: "index_user_permissions_on_user_id_and_permission", unique: true, using: :btree

  create_table "user_scripts", force: true do |t|
    t.integer  "user_id",          null: false
    t.integer  "script_id",        null: false
    t.datetime "started_at"
    t.datetime "completed_at"
    t.datetime "assigned_at"
    t.datetime "last_progress_at"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "user_scripts", ["user_id", "script_id"], name: "index_user_scripts_on_user_id_and_script_id", unique: true, using: :btree

  create_table "user_trophies", force: true do |t|
    t.integer  "user_id",    null: false
    t.integer  "trophy_id",  null: false
    t.integer  "concept_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "user_trophies", ["user_id", "trophy_id", "concept_id"], name: "index_user_trophies_on_user_id_and_trophy_id_and_concept_id", unique: true, using: :btree

  create_table "users", force: true do |t|
    t.string   "email",                                   default: "",      null: false
    t.string   "encrypted_password",                      default: "",      null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",                           default: 0
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
    t.string   "locale",                     limit: 10,   default: "en-US", null: false
    t.date     "birthday"
    t.string   "parent_email"
    t.string   "user_type",                  limit: 16
    t.string   "school"
    t.string   "full_address",               limit: 1024
    t.integer  "total_lines",                             default: 0,       null: false
    t.boolean  "prize_earned",                            default: false
    t.integer  "prize_id"
    t.boolean  "teacher_prize_earned",                    default: false
    t.integer  "teacher_prize_id"
    t.boolean  "teacher_bonus_prize_earned",              default: false
    t.integer  "teacher_bonus_prize_id"
    t.string   "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email"
    t.integer  "prize_teacher_id"
    t.boolean  "hint_access"
    t.integer  "secret_picture_id"
    t.integer  "secret_word_1_id"
    t.integer  "secret_word_2_id"
    t.boolean  "active",                                  default: true,    null: false
    t.string   "hashed_email"
  end

  add_index "users", ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true, using: :btree
  add_index "users", ["email"], name: "index_users_on_email", using: :btree
  add_index "users", ["hashed_email"], name: "index_users_on_hashed_email", using: :btree
  add_index "users", ["prize_id"], name: "index_users_on_prize_id", unique: true, using: :btree
  add_index "users", ["provider", "uid"], name: "index_users_on_provider_and_uid", unique: true, using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree
  add_index "users", ["teacher_bonus_prize_id"], name: "index_users_on_teacher_bonus_prize_id", unique: true, using: :btree
  add_index "users", ["teacher_prize_id"], name: "index_users_on_teacher_prize_id", unique: true, using: :btree
  add_index "users", ["username"], name: "index_users_on_username", unique: true, using: :btree

  create_table "videos", force: true do |t|
    t.string   "key"
    t.string   "youtube_code"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "download"
  end

end
