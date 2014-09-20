require 'cdo/solr'

def solr_query_to_param(q)
  params = []
  q.each_pair do |key,value|
    if value.kind_of?(Array)
      value.each{|value| params << {key=>value}.to_query}
    else
      params << {key=>value}.to_query
    end
  end
  params.join('&')
end
