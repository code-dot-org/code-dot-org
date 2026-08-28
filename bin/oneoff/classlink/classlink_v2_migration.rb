#!/usr/bin/env ruby

require_relative '../../../dashboard/config/environment'
require 'json'
require 'rest-client'

# Creates ClassLink v2 AuthenticationOptions for existing users who hold only a
# legacy v1 record. A v1 authentication_id is ClassLink's internal UserId; a v2
# one is "<TenantId>|<SourcedId>". For each v1-only record this script calls
# ClassLink's v2/my/info with the OAuth token stored on that record, reads
# SourcedId and TenantId out of the response, and builds the v2 option through
# Services::Classlink::V2AuthOptionBuilder. The v1 record is never modified.
#
# Usage:
#   ./bin/oneoff/classlink/classlink_v2_migration.rb [dry-run|commit]
#
# Dry run is the default and is what every argument other than "commit" means.
# It still makes every ClassLink call and still builds and validates every
# record; it just does not save. That makes a dry run a faithful preview of the
# commit run's counts, at the cost of taking as long as one.
#
# This script is an accelerator, not a prerequisite. Login-time migration in
# OmniauthCallbacksController#apply_classlink_v2_authentication_id creates the
# same record on the user's next sign-in, so every record skipped here migrates
# itself eventually. That is why nothing in this script aborts the run, and why
# a high skip count is a number to report rather than a reason to stop. What
# running it buys is timing: until a teacher has a v2 option, ClassLink
# rostering shows them a "sign out and sign back in" message instead of their
# class list.
#
# There is no way to tell in advance which stored tokens still work. ClassLink
# credentials are stored with expires: false, a null expiration, and no refresh
# token, so no expiry condition exists to filter on. The script calls with
# whatever token it has and counts what fails.
#
# Runtime: one HTTP round trip per record, issued serially, against a ~14k
# record population and an endpoint that has been measured in the hundreds of
# milliseconds. Budget an hour or two and run it detached (screen, tmux, nohup).
# Serial issue also keeps the request rate far below the level at which
# ClassLink degrades. The script is safely resumable: re-running it skips every
# user who already has a v2 option.
#
# The v2/my/info wire payload is PascalCase (UserId, SourcedId, TenantId). Note
# that omniauth-classlink's raw_info is *not* — the gem snake-cases the same
# payload — so code reading one is not a guide to code reading the other. If
# that assumption is ever wrong, every record skips as missing_fields and a
# short dry run says so immediately.
#
# ROLLBACK
#
# Undoing this migration means deleting the v2 options it created while leaving
# the v2 options that are somebody's only credential. The two are told apart by
# whether the user still has a v1 record: a user with both was migrated (v1 is
# intact and login works without the v2 row), a user with only v2 signed up or
# connected ClassLink after Phase 1 deployed and deleting their row would lock
# them out. From ./bin/rails runner in dashboard/:
#
#   classlink = AuthenticationOption::CLASSLINK
#   v1_user_ids = AuthenticationOption.
#     where(credential_type: classlink, version: nil).
#     where.not(user_id: nil).
#     select(:user_id)
#   AuthenticationOption.
#     where(credential_type: classlink, version: AuthenticationOption::Classlink::VERSION[:v2]).
#     where(user_id: v1_user_ids).
#     destroy_all
#
# AuthenticationOption is acts_as_paranoid, so this soft-deletes and is itself
# reversible. Preview the count with .count before running .destroy_all.

CLASSLINK = AuthenticationOption::CLASSLINK
V2 = AuthenticationOption::Classlink::VERSION[:v2]
SEPARATOR = AuthenticationOption::Classlink::SEPARATOR
INFO_URL = 'https://nodeapi.classlink.com/v2/my/info'.freeze
OPEN_TIMEOUT = 10
READ_TIMEOUT = 30
PROGRESS_EVERY = 250

do_dry_run = ARGV[0] != 'commit'

# Every skip reason gets a counter so the summary accounts for each examined
# record exactly once.
skipped = Hash.new(0)
examined = 0
migrated = 0

# Reports one skipped record. Deliberately carries no payload beyond ids: the
# v2/my/info response holds the user's name and email, and this output goes to
# a terminal and often to a pasted log.
report_skip = lambda do |auth_option, reason, detail = nil|
  skipped[reason] += 1
  line = "SKIP #{reason} auth_option_id=#{auth_option.id} user_id=#{auth_option.user_id}"
  line += " (#{detail})" if detail
  puts line
end

# Raised in place of whatever the call actually failed with, carrying only a
# description safe to print. See fetch_info.
class InfoFetchFailed < StandardError; end

# Returns the parsed v2/my/info body, or raises InfoFetchFailed. Rescues
# broadly on purpose: connection resets, TLS failures, timeouts, 4xx, 5xx and
# unparseable bodies all mean the same thing here — this record cannot be
# migrated now and will migrate itself at next login.
fetch_info = lambda do |oauth_token|
  body = RestClient::Request.execute(
    method: :get,
    url: INFO_URL,
    headers: {authorization: "Bearer #{oauth_token}"},
    open_timeout: OPEN_TIMEOUT,
    read_timeout: READ_TIMEOUT
  ).body
  parsed = JSON.parse(body)
  raise InfoFetchFailed, 'response body was not a JSON object' unless parsed.is_a?(Hash)
  parsed
rescue InfoFetchFailed
  raise
rescue StandardError => exception
  # The exception class, plus the HTTP status where there is one — 401s and
  # timeouts are the distinction worth seeing in the summary. Not the message:
  # JSON::ParserError quotes the body it choked on, and the body is the user's
  # profile. RestClient exceptions all answer http_code, but a timeout or a
  # refused connection answers it with nil, hence the presence check.
  code = exception.http_code if exception.respond_to?(:http_code)
  raise InfoFetchFailed, [exception.class, code].compact.join(' ')
end

# Users who already hold a v2 option need no call. The user_id guard is not
# stylistic: SQL's NOT IN yields NULL rather than true when the subquery
# contains one, so a single NULL here would silently reduce `pending` to
# nothing and the run would report a clean zero. The column is NOT NULL today
# — belongs_to :user is optional only in the model — so this costs nothing and
# removes the failure mode's only route in.
migrated_user_ids = AuthenticationOption.
  where(credential_type: CLASSLINK, version: V2).
  where.not(user_id: nil).
  select(:user_id)

# version is nil on every legacy record: PR 1 writes 'v2' only for the new
# format, and stamps connect_provider's version through Classlink.version_for,
# which returns nil for a UserId. Matching on nil rather than on "not v2" is
# both the accurate filter and the conservative one — an unrecognized version
# is left alone. Soft-deleted rows are excluded by the acts_as_paranoid default
# scope, which is what we want: a deleted credential is not migrated.
pending = AuthenticationOption.
  where(credential_type: CLASSLINK, version: nil).
  where.not(user_id: migrated_user_ids)

total = pending.count
started_at = Time.now
puts "Starting ClassLink v2 migration. Dry run mode: #{do_dry_run}"
puts "v1-only ClassLink auth options to examine: #{total}"

# find_each re-runs the query per batch, so rows become invisible as their user
# gains a v2 option. That only ever hides a user we have already handled in this
# run — which is the correct outcome — because batches advance by primary key
# and we only ever insert new rows.
pending.find_each do |auth_option|
  examined += 1
  if (examined % PROGRESS_EVERY).zero?
    elapsed = Time.now - started_at
    puts "... #{examined}/#{total} examined, #{migrated} built, #{elapsed.round}s elapsed"
  end

  # An id already carrying a separator is v2-format but unversioned. Nothing to
  # build, and calling the API for it would waste a round trip.
  if auth_option.authentication_id.to_s.include?(SEPARATOR)
    report_skip.call(auth_option, 'already_v2_format')
    next
  end

  oauth_token = auth_option.data_hash[:oauth_token]
  if oauth_token.blank?
    report_skip.call(auth_option, 'no_token')
    next
  end

  begin
    info = fetch_info.call(oauth_token)
  rescue InfoFetchFailed => exception
    report_skip.call(auth_option, 'api_failed', exception.message)
    next
  end

  sourced_id = info['SourcedId']
  tenant_id = info['TenantId']
  returned_user_id = info['UserId']
  # UserId is checked for presence here, alongside the two fields actually
  # used, so that a payload missing all three reads as missing_fields rather
  # than as an identity_mismatch against an empty string — the difference
  # between "ClassLink sent something we don't recognize" and "this token
  # belongs to someone else", which are diagnosed very differently.
  if sourced_id.blank? || tenant_id.blank? || returned_user_id.blank?
    report_skip.call(auth_option, 'missing_fields')
    next
  end

  # The token proves who ClassLink thinks the caller is; the record says who we
  # think the token belongs to. Login-time migration gets that binding from the
  # live sign-in and needs no check, but here both halves are stored values and
  # nothing else confirms they still describe the same person. A mismatch would
  # stamp one ClassLink identity onto another user's account, so it stops here.
  if returned_user_id.to_s != auth_option.authentication_id.to_s
    report_skip.call(auth_option, 'identity_mismatch')
    next
  end

  # Returns nil when the components cannot form an id (reported to Sentry by
  # AuthIdGenerator), when the v1 record cannot be found byte-exactly, or when
  # the v2 id already exists. All three are correct no-ops here.
  new_auth_option = Services::Classlink::V2AuthOptionBuilder.call(
    classlink_v1_id: auth_option.authentication_id,
    tenant_id: tenant_id,
    sourced_id: sourced_id
  )
  if new_auth_option.nil?
    report_skip.call(auth_option, 'builder_declined')
    next
  end

  # Dry run validates instead of saving, so it reports the same failures a
  # commit run would rather than counting a record that would not persist.
  saved = do_dry_run ? new_auth_option.valid? : new_auth_option.save
  if saved
    migrated += 1
  else
    report_skip.call(auth_option, 'save_failed', new_auth_option.errors.full_messages.join('; '))
  end
rescue StandardError => exception
  # One bad record must not end a run measured in hours.
  report_skip.call(auth_option, 'unexpected_error', exception.class.to_s)
end

puts
puts "Examined: #{examined}"
puts "v2 AuthenticationOptions #{do_dry_run ? 'that would be created' : 'created'}: #{migrated}"
puts "Skipped: #{skipped.values.sum}"
skipped.sort.each {|reason, count| puts "  #{reason}: #{count}"}
puts "Elapsed: #{(Time.now - started_at).round}s"
puts "ClassLink v2 migration completed. Dry run mode: #{do_dry_run}"
