json.array!(@learning_modules) do |learning_module|
  json.extract! learning_module, :id
  json.url learning_module_url(learning_module, format: :json)
end
