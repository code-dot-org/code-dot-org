#!/usr/bin/env ruby
require File.expand_path('../../../pegasus/src/env', __FILE__)
require 'cdo/db'
require 'cdo/poste'

# Create a [poste_messages.id -> template] hash of poste_messages so we don't
# need to query for each delivery
templates = POSTE_DB[:poste_messages].to_hash(:id, :name).map do |id, name|
  # copied from Deliverer.load_template
  path = Poste.resolve_template(name)
  raise ArgumentError, "#{name.inspect} template wasn't found." unless path
  template = Poste::Template.new path
  [id, template]
end.to_h

# for each email we've delivered in the last year, simply attempt to render the
# email so we will trigger the existing "ActionView/TextRender incompatibility"
# warnings for that email.
#
# We do this because many of our emails are seasonal, so if we want to test
# this thoroughly with the existing passive approach, we'd have to wait like a
# year to be sure.
deliveries = POSTE_DB[:poste_deliveries].where("sent_at > '2019-01-01'")
total = deliveries.count
i = 0
deliveries.paged_each do |delivery|
  template = templates[delivery[:message_id]]
  raise ValueError, "poste_messages[#{delivery[:message_id]}] does not exist" unless template
  template.render(JSON.parse(delivery[:params]))
  i += 1
  puts "#{i}/#{total} finished (#{i * 100 / total}%)" if i % (total / 5) == 0
end
