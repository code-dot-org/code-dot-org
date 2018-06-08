require 'cdo/db'

# Helper functions for Pegasus forms.
module Forms
  Sequel.extension :core_refinements
  using Sequel::CoreRefinements
  FORMS = ::PEGASUS_DB[:forms]

  # Converts a simple x.y JSON-attribute path to a MySQL 5.7 JSON expression using the inline-path operator.
  # Ref: https://dev.mysql.com/doc/refman/5.7/en/json-search-functions.html#operator_json-inline-path
  def self.json(path)
    column, attribute = path.split('.')
    "#{column}->>'$.#{attribute}'".lit
  end

  COUNTRY_CODE = :location_country_code_s
  STATE_CODE = json('processed_data.location_state_code_s')

  class << self
    def events_by_country(
      kind,
      except_country='US',
      country_column: COUNTRY_CODE,
      entire_school: false,
      review_approved: false,
      explain: false
    )
      FORMS.
        where(kind: kind).
        where(entire_school ? {json('data.entire_school_flag_b') => true} : {}).
        where(review_approved ? {review: 'approved'} : {}).
        exclude(country_column => except_country).
        group_and_count(country_column.as(:country_code)).
        tap {|x| puts x.sql, x.explain if explain}.
        all
    end

    def events_by_state(
      kind,
      country='US',
      explain: false,
      country_column: COUNTRY_CODE,
      entire_school: false,
      review_approved: false,
      state_column: STATE_CODE
    )
      FORMS.
        where(
          kind: kind,
          country_column => country
        ).
        where(entire_school ? {json('data.entire_school_flag_b') => true} : {}).
        where(review_approved ? {review: 'approved'} : {}).
        group_and_count(
          state_column.as(:state_code)
        ).
        tap {|x| puts x.sql, x.explain if explain}.
        all
    end

    def events_by_name(
      kind,
      country='US',
      state=nil,
      explain: false,
      country_column: COUNTRY_CODE,
      state_column: STATE_CODE,
      entire_school: false,
      review_approved: false,
      city_column: json('processed_data.location_city_s')
    )
      where[state_column] = state if state

      FORMS.
        select(
          json('data.organization_name_s').as(:name),
          city_column.as(:city)
        ).
        where(
          kind: kind,
          country_column => country
        ).
        where(state ? {state_column => state} : {}).
        where(entire_school ? {json('data.entire_school_flag_b') => true} : {}).
        where(review_approved ? {review: 'approved'} : {}).
        order_by(:city, :name).
        distinct.
        tap {|x| puts x.sql, x.explain if explain}.
        all
    end
  end
end
