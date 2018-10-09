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

  def self.kind
    "HocSignup#{DCDO.get('hoc_year', 2017)}"
  end

  def self.events_by_country(**rest)
    events_query(rest).
      exclude(COUNTRY_CODE_COLUMN => 'US').
      group_and_count(COUNTRY_CODE_COLUMN.as(:country_code)).
      all
  end

  def self.events_by_state(**rest)
    country = 'US'

    events_query(rest).
      where(COUNTRY_CODE_COLUMN => country).
      exclude(STATE_CODE_COLUMN => nil).
      group_and_count(
        STATE_CODE_COLUMN.as(:state_code)
      ).
      all
  end

  private_class_method def self.events_query(
    special_events_only: false,
    reviewed: nil
  )
    query = FORMS.where(kind: kind)

    if special_events_only
      query = query.where(json('data.special_event_flag_b') => true)
    end

    unless reviewed.nil?
      query = reviewed ? query.exclude(review: nil) : query.where(review: nil)
    end

    query
  end
end
