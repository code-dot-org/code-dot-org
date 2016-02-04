json.array!(@artifacts) do |artifact|
  json.extract! artifact, :id
  json.url artifact_url(artifact, format: :json)
end
