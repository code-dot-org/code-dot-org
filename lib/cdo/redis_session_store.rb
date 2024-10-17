# frozen_string_literal: true

require 'action_dispatch/middleware/session/redis_store'
require 'fileutils'

module Cdo
  # This class extends +ActionDispatch::Session::RedisStore+ (:redis_store)
  # to resolve the issue of deleted sessions being restored during concurrent requests.
  #
  # @see https://docs.google.com/document/d/1_H7SDk1vPnUr5N7I14FPSoYs2bPPBGUz7KUAIE8X_A0
  class RedisSessionStore < ActionDispatch::Session::RedisStore
    # Overrides +Rack::Session::Redis#delete_session+ to temporarily mark the session as deleted,
    # allowing concurrent requests to identify that the session is being deleted and prevent its restoration.
    #
    # @see https://github.com/redis-store/redis-rack/blob/v3.0.0/lib/rack/session/redis.rb#L54
    # @see http://web.archive.org/web/20201023020301/https://paulbutcher.com/2007/05/01/race-conditions-in-rails-sessions-and-how-to-fix-them/
    def delete_session(req, sid, ...)
      super
    ensure
      write_session(req, sid, {deleted: true}, ex: 60) # marks the session as deleted for 60 seconds
      req.session.delete('deleted') # prevents commiting the "deleted" flag to the renewed session
      # By default, a deleted session should be renewed, which involves generating a new session ID and cookie for it.
      # However, since the deleted session is being overwritten with the "deleted" flag, it will bypass the renewal step.
      # Therefore, we need to manually set the :renew option to force the session to be renewed.
      # See:
      # - https://github.com/rack/rack/blob/v2.2.9/lib/rack/session/abstract/id.rb#L217-L218
      # - https://github.com/rack/rack/blob/v2.2.9/lib/rack/session/abstract/id.rb#L377-L380
      # - https://github.com/redis-store/redis-rack/blob/v3.0.0/lib/rack/session/redis.rb#L60
      req.session.options[:renew] = true
    end

    # Overrides +Rack::Session::Abstract::Persisted#commit_session?+ to skip committing a session
    # that was deleted during a previous concurrent request, preventing the restoration of that session.
    #
    # @see https://github.com/rack/rack/blob/v2.2.9/lib/rack/session/abstract/id.rb#L342
    private def commit_session?(req, session, options)
      unless options[:renew]
        store_session = load_session(req).second.stringify_keys
        return false if store_session['deleted']
      end

      super
    end

    # Overrides +Rack::Session::Abstract::Persisted#commit_session+ to add a global lock
    # ensuring that only one process at a time can commit changes to the same session.
    #
    # @note Using the +File#flock+ exclusive lock to ensure single-process access.
    # @see https://github.com/rack/rack/blob/v2.2.9/lib/rack/session/abstract/id.rb#L373
    private def commit_session(req, ...)
      lockfile = CDO.dir('dashboard', 'tmp', "commit_session_#{current_session_id(req)}.lock")

      File.open(lockfile, 'w') do |f|
        f.flock(File::LOCK_EX) # the next process will wait until the current process releases the lock
        f.write_nonblock('l') # indicates that the lock is acquired

        super
      ensure
        f.truncate(0) # indicates that the lock is released
        f.flock(File::LOCK_UN) # releases the lock
      end
    ensure
      # A non-empty lockfile indicates that it is in use by another process, so it should not be deleted.
      FileUtils.rm_f(lockfile) if File.empty?(lockfile)
    end
  end
end
