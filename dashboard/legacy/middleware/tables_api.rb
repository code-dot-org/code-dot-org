# TODO: post-firebase-cleanup, consider removing this file, see https://github.com/code-dot-org/code-dot-org/issues/56996#issuecomment-1977935612, post-firebase-cleanup issue is: #56994
# consider test_tables.rb in evaluating if we can fully remove this file.

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
    ].each do |file|
      load(CDO.dir('dashboard', 'legacy', 'middleware', 'helpers', file))
    end
  end
end
