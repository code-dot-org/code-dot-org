json.array!(@callouts) do |callout|
  json.extract! callout, :element_id, :text
  json.url callout_url(callout, format: :json)
end
