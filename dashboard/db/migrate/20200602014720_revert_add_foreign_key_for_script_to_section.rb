require_relative '20200529004150_add_foreign_key_for_script_to_section.rb'

class RevertAddForeignKeyForScriptToSection < ActiveRecord::Migration[5.0]
  def change
    # Original migration was never successfully applied to production,
    # which is the reason we need to revert in the first place.
    return if Rails.env.production?

    revert AddForeignKeyForScriptToSection

    # An index was implicitly added when foreign key constraint added, and rails doesn't know to delete it
    # as part of the revert: https://github.com/rails/rails/issues/20048
    remove_index :sections, name: :fk_rails_5c2401d1cb
  end
end
