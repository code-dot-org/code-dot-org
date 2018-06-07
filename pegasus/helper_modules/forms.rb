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
    def events_by_country(kind, except_country='US', explain: false)
      FORMS.
        where(kind: kind).
        exclude(COUNTRY_CODE => except_country).
        group_and_count(COUNTRY_CODE.as(:country_code)).
        tap {|x| puts x.sql, x.explain if explain}.
        all
    end

    def events_by_state(kind, country='US', explain: false)
      FORMS.
        where(
          kind: kind,
          COUNTRY_CODE => country
        ).
        group_and_count(
          STATE_CODE.as(:state_code)
        ).
        tap {|x| puts x.sql, x.explain if explain}.
        all
    end

    def events_by_name(kind, country='US', state=nil, explain: false)
      where = {
        kind: kind,
        COUNTRY_CODE => country
      }
      where[STATE_CODE] = state if state

      FORMS.
        select(
          json('data.organization_name_s').as(:name),
          json('processed_data.location_city_s').as(:city)
        ).
        where(where).
        order_by(:city, :name).
        distinct.
        tap {|x| puts x.sql, x.explain if explain}.
        all
    end
  end
end
