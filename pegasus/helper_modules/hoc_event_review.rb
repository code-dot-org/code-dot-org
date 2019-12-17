require 'cdo/db'

# Helper functions Hour of Code special event review controls
module HocEventReview
  Sequel.extension :core_refinements
  using Sequel::CoreRefinements

  # Converts a simple x.y JSON-attribute path to a MySQL 5.7 JSON expression using the inline-path operator.
  # Ref: https://dev.mysql.com/doc/refman/5.7/en/json-search-functions.html#operator_json-inline-path
  private_class_method def self.json(path)
    column, attribute = path.split('.')
    "#{column}->>'$.#{attribute}'".lit
  end

  FORMS = ::PEGASUS_DB[:forms]
  COUNTRY_CODE_COLUMN = :location_country_code_s
  STATE_CODE_COLUMN = json('processed_data.location_state_code_s')
  SPECIAL_EVENT_FLAG_COLUMN = json('data.special_event_flag_b')

  # Get non-US event counts by country
  # (used for event review overview page)
  def self.event_counts_by_country(**rest)
    events_query(rest).
      exclude(COUNTRY_CODE_COLUMN => 'US').
      group_and_count(COUNTRY_CODE_COLUMN.as(:country_code)).
      all
  end

  # Get US event counts by state
  # (used for event review overview page)
  def self.event_counts_by_state(**rest)
    events_query(rest).
      where(COUNTRY_CODE_COLUMN => 'US').
      exclude(STATE_CODE_COLUMN => nil).
      group_and_count(
        STATE_CODE_COLUMN.as(:state_code)
      ).
      all
  end

  # Get events according to given filters
  def self.events(**rest)
    events_query(rest).
      select(:data, :secret, :processed_data).
      limit(100).
      map do |form|
        next unless form[:processed_data]
        JSON.parse(form[:data]).
          merge(secret: form[:secret]).
          merge(JSON.parse(form[:processed_data]))
      end.
      compact
  end

  private_class_method def self.events_query(
    special_events_only: false,
    reviewed: nil,
    country: nil,
    state: nil
  )
    query = FORMS.where(kind: kind)

    if special_events_only
      query = query.where(SPECIAL_EVENT_FLAG_COLUMN => true)
    end

    unless reviewed.nil?
      query = reviewed ? query.exclude(review: nil) : query.where(review: nil)
    end

    if state
      query = query.where(STATE_CODE_COLUMN => state.upcase)
    elsif country
      query = query.where(COUNTRY_CODE_COLUMN => country.upcase)
    end

    query
  end

  def self.kind
    "HocSignup#{DCDO.get('hoc_year', 2017)}"
  end
end
