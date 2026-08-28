module Cdo
  module ClearStaleCache
    def self.call
      curr_git_revision = GitUtils.git_revision
      last_git_revision = Rails.cache.fetch('last_git_revision') {curr_git_revision}
      Rails.cache.clear unless last_git_revision == curr_git_revision
    end
  end
end

# To support our persistent managed servers which may have stale cache data
# from a previous deploy, make sure to clear the cache before service start if
# we're building from a different git commit.
Rails.application.config.before_initialize do
  Cdo::ClearStaleCache.call
end
