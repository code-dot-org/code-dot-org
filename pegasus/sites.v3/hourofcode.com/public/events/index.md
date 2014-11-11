---
title: <%= hoc_s(:events_title) %>
layout: wide
---
<%
  SOLR = Solr::Server.new(host:CDO.solr_server)

  by_country = {}
  by_state = {}

  events = SOLR.query(q:"*:*", fq:["kind_s:HocSignup2014", "location_country_s:[* TO *]", "organization_name_s:[* TO *]"], sort:'location_country_s asc, location_state_s asc', rows:1000)
  events.each do |event|
    country = event['location_country_s'].to_s
    by_country[country] = [] unless by_country.has_key?(country)
    by_country[country] << event

    if country == 'United States'
      state = event['location_state_s'].to_s
      by_state[state] = [] unless by_state.has_key?(state)
      by_state[state] << event
    end
  end
%>

<script src='/js/event-list.js'></script>

# Hour of Code events by country and state

<%
  by_country.each_pair do |country, events|
%>
<h2 class="hoc-event-country"><%= country %></h2>
<%
    if country == "United States"
      by_state.each_pair do |state, events|
        unless state.nil_or_empty?
%>
<h3 class="hoc-event-state"><%= state %></h3>
<ul>
<%
          event_names = [];
          events.sort{|a,b|a['organization_name_s']<=>b['organization_name_s']}.each do |event|
            event_name = event['organization_name_s']
            event_name += ' (' + event['location_city_s'] + ')' unless event['location_city_s'].nil_or_empty?
            event_names << event_name
          end
          event_names.uniq{|s|s} .each do |event_name|
%>
<li class="hoc-event"><%= event_name %></li>
<%
          end
        end
%>
</ul>
<%
      end
    else
%>
<ul>
<%
      event_names = [];
      events.sort{|a,b|a['organization_name_s']<=>b['organization_name_s']}.each do |event|
        event_name = event['organization_name_s']
        event_name += ' (' + event['location_city_s'] + ')' unless event['location_city_s'].nil_or_empty?
        event_names << event_name
      end
      event_names.uniq{|s|s} .each do |event_name|
%>
<li class="hoc-event"><%= event_name %></li>
<%
      end
%>
</ul>
<%
    end
  end
%>
