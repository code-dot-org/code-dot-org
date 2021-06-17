class DedupLevelKeysNonProd < ActiveRecord::Migration[5.2]
  def up
    # Two levels should never have the same key. Levels with duplicate keys will
    # be manually removed in levelbuilder and production, since the stakes are
    # higher for deleting levels there. This PR removes duplicates from all
    # other environments.

    if [:adhoc, :development, :staging, :test].include? rack_env
      duplicate_keys = Level.all.map(&:key).sort.group_by {|k| k}.select {|_k, v| v.length > 1}.map(&:first)
      duplicate_levels = duplicate_keys.map {|key| Level.where(Level.key_to_params(key)).all}.flatten
      levels_to_destroy = duplicate_levels.reject {|l| l.script_levels.any?}
      puts "removing the following levels, which have duplicate keys:"
      puts levels_to_destroy.map {|l| "id: #{l.id} key: #{l.key}"}.join("\n")
      levels_to_destroy.each(&:destroy)
    end
  end

  def down
  end
end
