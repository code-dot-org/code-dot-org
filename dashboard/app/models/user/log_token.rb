# Pseudonyms for user ids, so logs and third parties never carry the raw id.
# Tokens are random rather than derived, so this table is the only way back.
# Rows must outlive the logs carrying their tokens: with a school-year window
# and 90-day log retention, that is the current window and the one before it.
class User::LogToken < ApplicationRecord
  data_classification(
    id: :confidential,
    user_id: :confidential,
    destination: :confidential,
    period: :confidential,
    # A pseudonym still identifies a person; Project.uuid is classified the same.
    uuid: :restricted,
    created_at: :confidential,
    updated_at: :confidential,
  )

  # Renaming or reusing a name orphans every token already minted under it.
  DESTINATIONS = [
    SENTRY = 'sentry',
  ].freeze

  # Bounds how long a deleted row keeps answering.
  CACHE_TTL = 12.hours

  # Matches ApplicationHelper#school_year: 7/1 YYYY - 6/30 YYYY+1.
  ROLLOVER_MONTH = 7

  belongs_to :user, -> {with_deleted}

  # Reads without minting, so the admin page can list what a user already has.
  scope :for_user, ->(user_id) {where(user_id: user_id).order(period: :desc, destination: :asc)}

  validates :destination, inclusion: {in: DESTINATIONS}
  validates :period, presence: true
  validates :uuid, presence: true, uniqueness: true

  class << self
    # Called per request: must not raise, and must never fall back to the raw id.
    def token_for(user_id, destination:)
      return nil unless known_destination?(destination)

      id = normalize(user_id)
      return nil unless id

      period = current_period
      Rails.cache.fetch(cache_key(id, destination, period), expires_in: CACHE_TTL, skip_nil: true) do
        mint(id, destination, period)
      end
    rescue StandardError => exception
      CDO.log.warn "[user_log_token] could not read or mint a token: #{exception.class}: #{exception.message}"
      nil
    end

    # The audit is written here, not in the controller, so a console cannot skip it.
    # Failures are audited too: a burst of them is the signal.
    def resolve(token, actor_id:, reason:, request_id: nil)
      actor = normalize(actor_id)
      raise ArgumentError, 'actor_id must be the user id of whoever is resolving' unless actor
      raise ArgumentError, 'reason is required to resolve a user log token' if reason.to_s.strip.empty?

      record = find_by(uuid: token.to_s.strip)
      result = record && {user_id: record.user_id, destination: record.destination, period: record.period}
      audit(result: result, actor_id: actor, reason: reason, request_id: request_id)
      result
    end

    # The school year this falls in, labelled by the year it starts.
    def current_period
      today = Time.zone.today
      today.month >= ROLLOVER_MONTH ? today.year : today.year - 1
    end

    private def known_destination?(destination)
      return true if DESTINATIONS.include?(destination)

      CDO.log.warn "[user_log_token] unknown destination #{destination.inspect}; " \
        "expected one of #{DESTINATIONS.join(', ')}"
      false
    end

    # The unique index turns a concurrent mint into a read of the winner's row.
    private def mint(user_id, destination, period)
      create_with(uuid: SecureRandom.uuid).
        find_or_create_by!(user_id: user_id, destination: destination, period: period).uuid
    rescue ActiveRecord::RecordNotUnique
      find_by(user_id: user_id, destination: destination, period: period)&.uuid
    end

    private def cache_key(user_id, destination, period)
      "user_log_token/#{destination}/#{period}/#{user_id}"
    end

    # The admin form passes a String; it must reach the same row as an Integer.
    private def normalize(user_id)
      return nil if user_id.nil?

      string = user_id.to_s.strip
      return nil unless string.match?(/\A\d+\z/)

      value = string.to_i
      value.positive? ? value : nil
    end

    # Never records the token: token => user id pairs would copy what this guards.
    private def audit(result:, actor_id:, reason:, request_id:)
      payload = {
        event: 'resolve_user_log_token',
        namespace: 'admin',
        request_id: request_id,
        authenticated_user_id: actor_id,
        affected_user_id: result && result[:user_id],
        destination: result && result[:destination],
        period: result && result[:period],
        outcome: result ? 'resolved' : 'not_resolved',
        reason: reason.to_s.strip,
      }.compact
      CDO.log.warn payload.to_json
    end
  end
end
