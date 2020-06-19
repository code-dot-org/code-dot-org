class AddForeignKeyForScriptToSection < ActiveRecord::Migration[5.0]
  def change
    # This migration failed in production because it takes too long to apply (roughly 4 minutes).
    # We reverted it in RevertAddForeignKeyForScriptToSection. As clean up we are removing the
    # content of this and the revert migrations.
    # See https://github.com/code-dot-org/code-dot-org/pull/35088 for more details.
  end
end
