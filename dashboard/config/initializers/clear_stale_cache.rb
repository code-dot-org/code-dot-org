module Cdo
  module ClearStaleCache
    CACHE_KEY = 'last_git_revision'

    def self.call
      curr_git_revision = GitUtils.git_revision
      last_git_revision = Rails.cache.fetch(CACHE_KEY) {curr_git_revision}
      unless last_git_revision == curr_git_revision
        Rails.cache.clear
        Rails.cache.write(CACHE_KEY, curr_git_revision)
      end
    end
  end
end

# To support our persistent managed servers which may have stale cache data
# from a previous deploy, make sure to clear the cache before service start if
# we're building from a different git commit.
Rails.application.config.before_initialize do
  Cdo::ClearStaleCache.call if CDO.running_web_application?
end
