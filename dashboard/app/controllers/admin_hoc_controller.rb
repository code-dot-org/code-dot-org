require 'cdo/env'

# The controller for reports of HOC data.
class AdminHocController < ApplicationController
  before_filter :authenticate_user!
  before_action :require_admin
  check_authorization

  include LevelSourceHintsHelper

  def event_signups
    SeamlessDatabasePool.use_persistent_read_connection do
      # Requested by Roxanne on 16 November 2015 to track HOC 2015 signups by day.
      # Get the HOC 2014 and HOC 2015 signup counts by day, deduped by email and name.
      # We restrict by dates to avoid long trails of (inappropriate?) signups.
      data_2014 = DB[:forms].
                  where('kind = ? AND created_at > ? AND created_at < ?', 'HocSignup2014', '2014-08-01', '2015-01-01').
                  group(:name, :email).
                  # TODO(asher): Is this clumsy notation really necessary? Is Sequel
                  # really this stupid? Also below.
                  group_and_count(Sequel.as(Sequel.qualify(:forms, :created_at).cast(:date),:created_at_day)).
                  order(:created_at_day).
                  all.
                  map{|row| [row[:created_at_day].strftime("%m-%d"), row[:count].to_i]}
      data_2015 = DB[:forms].
                  where('kind = ? AND created_at > ? AND created_at < ?', 'HocSignup2015', '2015-08-01', '2016-01-01').
                  group(:name, :email).
                  group_and_count(Sequel.as(Sequel.qualify(:forms, :created_at).cast(:date),:created_at_day)).
                  order(:created_at_day).
                  all.
                  map{|row| [row[:created_at_day].strftime("%m-%d"), row[:count].to_i]}

      # Construct the hash {MM-DD => [count2014, count2015]}.
      # Start by constructing the key space as the union of the MM-DD dates for
      # data_2014 and data_2015.
      require 'set'
      dates = Set.new []
      data_2014.each do |day|
        dates.add(day[0])
      end
      data_2015.each do |day|
        dates.add(day[0])
      end
      # Then populate the keys of our hash {date=>[count2014,count2015], ..., date=>[...]} with dates.
      data_by_day = {}
      dates.each do |date|
        data_by_day[date] = [0, 0]
      end
      # Finally populate the values of our hash.
      data_2014.each do |day|
        data_by_day[day[0]][0] = day[1]
      end
      data_2015.each do |day|
        data_by_day[day[0]][1] = day[1]
      end

      render locals: {data_by_day: data_by_day.sort}
    end
  end

  def students_served
    SeamlessDatabasePool.use_persistent_read_connection do
      @data = Properties.get(:hoc_metrics)
    end
  end
end
