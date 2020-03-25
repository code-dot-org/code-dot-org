#!/usr/bin/env ruby
require File.expand_path('../../../pegasus/src/env', __FILE__)
require 'cdo/db'
require 'cdo/poste'

# Create a [poste_messages.id -> template] hash of poste_messages so we don't
# need to query for each delivery
templates = POSTE_DB[:poste_messages].to_hash(:id, :name).map do |id, name|
  # copied from Deliverer.load_template
  path = Poste.resolve_template(name)
  unless path
    puts "#{name.inspect} template (id: #{id}) wasn't found."
    next
  end
  template = Poste::Template.new path
  [id, template]
end.compact.to_h

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

# implement paging manually so we can use .all
# We can't use .paged_each (or even .each) because template.render can issue a
# query, and you apparently can't nest queries in Sequel. See
# https://github.com/jeremyevans/sequel/issues/1096
page_size = 1000
page = 0
while i < total
  deliveries.limit(page_size).offset(page_size * page).all.each do |delivery|
    template = templates[delivery[:message_id]]
    template.render(JSON.parse(delivery[:params])) if template
    i += 1
    puts "#{i}/#{total} finished (#{i * 100 / total}%)" if i % (total / 5) == 0
  end

  page += 1
end
