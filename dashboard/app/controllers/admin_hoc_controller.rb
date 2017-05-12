require 'cdo/env'
require 'set'

# The controller for reports of HOC data.
class AdminHocController < ApplicationController
  before_action :authenticate_user!
  before_action :require_admin
  check_authorization

  def event_signups
    # A hash from HOC year to HOC data.
    event_signup_data = {2014 => nil, 2015 => nil, 2016 => nil}
    SeamlessDatabasePool.use_persistent_read_connection do
      # Get the HOC signup counts by day, deduped by email and name. We restrict
      # to August through December to avoid long trails of (inappropriate?)
      # signups.
      event_signup_data.keys.each do |year|
        event_signup_data[year] = DB[:forms].
          where(
            'kind = ? AND created_at > ? AND created_at < ?',
            "HocSignup#{year}",
            "#{year}-08-01",
            "#{year.to_i + 1}-01-01"
          ).
          group(:name, :email).
          group_and_count(
            Sequel.as(
              Sequel.qualify(:forms, :created_at).cast(:date),
              :created_at_day
            )
          ).
          order(:created_at_day).
          all.
          map do |row|
            [row[:created_at_day].strftime("%m-%d"), row[:count].to_i]
          end
      end
    end

    # Construct the hash {MM-DD => [count2014, count2015, count2016]}.
    # Start by constructing the key space as the union of the MM-DD dates.
    dates = Set.new []
    event_signup_data.values.each do |data|
      data.each do |day|
        dates.add day[0]
      end
    end
    # Then populate the hash, using zeros as placeholders for value counts.
    event_signups_by_day = {}
    dates.sort.each do |date|
      event_signups_by_day[date] = Array.new(event_signup_data.length, 0)
    end
    # Finally populate the values of our hash.
    event_signup_data.values.each_with_index do |data, index|
      data.each do |day|
        event_signups_by_day[day[0]][index] = day[1]
      end
    end

    render locals: {event_signups_by_day: event_signups_by_day.to_a}
  end

  def students_served
    SeamlessDatabasePool.use_persistent_read_connection do
      @data = Properties.get(:hoc_metrics)
    end
  end
end
