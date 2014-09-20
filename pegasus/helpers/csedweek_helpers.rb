def load_json_file(path)
  File.open(path,'rb') do |file|
    return JSON.load(file)
  end
end
