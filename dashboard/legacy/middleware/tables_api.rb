# TODO: unfirebase, when we move this to the datablock_storage_controler should we delete this whole file? see: #56996

require 'sinatra/base'
require 'cdo/sinatra'
require 'cdo/rack/request'
require 'csv'

class TablesApi < Sinatra::Base
  set :mustermann_opts, check_anchors: false

  load(CDO.dir('shared', 'middleware', 'helpers', 'core.rb'))

  helpers do
    [
      'table.rb',
      'firebase_helper.rb',
    ].each do |file|
      load(CDO.dir('dashboard', 'legacy', 'middleware', 'helpers', file))
    end
  end

  # GET /v3/export-firebase-tables/<channel-id>/table-name
  #
  # Exports a csv file from a table where the first row is the column names
  # and additional rows are the column values.
  #
  # TODO: unfirebase, this should moved to datablock_storage_controler, see: #56996
  #
  get %r{/v3/export-firebase-tables/([^/]+)/([^/]+)$} do |channel_id, table_name| # TODO: unfirebase
    dont_cache
    content_type :csv
    response.headers['Content-Disposition'] = "attachment; filename=\"#{table_name}.csv\""

    # TODO: post-firebase-cleanup, remove the firebase version: #56994
    return FirebaseHelper.new(channel_id).table_as_csv(table_name)
  end
end
