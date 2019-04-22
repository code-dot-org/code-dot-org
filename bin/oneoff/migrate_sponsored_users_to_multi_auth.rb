#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'

# The only effect that user.migrate_to_multi_auth has on sponsored users is to
# update the "provider" field to "migrated", so for simplicity we do all those
# directly with SQL
User.
  where(provider: User::PROVIDER_SPONSORED).
  in_batches(of: 100_000).
  update_all(provider: User::PROVIDER_MIGRATED)
