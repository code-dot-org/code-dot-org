require 'sinatra/base'
require 'cdo/sinatra'
require 'cdo/rack/request'
require 'csv'

class TablesApi < Sinatra::Base
  set :mustermann_opts, check_anchors: false

  helpers do
    [
      'core.rb',
      'table.rb',
      'firebase_helper.rb',
    ].each do |file|
      load(CDO.dir('shared', 'middleware', 'helpers', file))
    end
  end

  # GET /v3/export-firebase-tables/<channel-id>/table-name
  #
  # Exports a csv file from a table where the first row is the column names
  # and additional rows are the column values.
  #
  get %r{/v3/export-firebase-tables/([^/]+)/([^/]+)$} do |channel_id, table_name|
    dont_cache
    content_type :csv
    response.headers['Content-Disposition'] = "attachment; filename=\"#{table_name}.csv\""

    return FirebaseHelper.new(channel_id).table_as_csv(table_name)
  end
end
