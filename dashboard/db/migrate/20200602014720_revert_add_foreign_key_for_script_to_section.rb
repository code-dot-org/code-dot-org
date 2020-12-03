require_relative '20200529004150_add_foreign_key_for_script_to_section.rb'

class RevertAddForeignKeyForScriptToSection < ActiveRecord::Migration[5.0]
  def change
    # The AddForeignKeyForScriptToSection migration failed in production because it
    # takes too long to apply (roughly 4 minutes). This reverted it. As clean up we
    # are removing the content of this and the original migrations.
    # See https://github.com/code-dot-org/code-dot-org/pull/35088 for more details.
  end
end
