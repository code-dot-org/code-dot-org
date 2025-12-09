#!/usr/bin/env ruby

require 'json'
require_relative '../../dashboard/config/environment'

BASE_DIR = "#{Rails.root}/../bin/aidiff_embeddings/scrape-page"
OUTPUT_DIR = "#{BASE_DIR}/scrape_output"
EMBEDDINGS_BUCKET = 'cdo-ai-diff-production'

Dir.chdir(BASE_DIR) do
  system('yarn install')

  file_paths = Dir["#{OUTPUT_DIR}/*"]

  # Scrape URLs referenced in metadata files, save output to HTML files
  file_paths.each do |metadata_path|
    if metadata_path.match? /.metadata.json$/
      output_path = metadata_path.gsub(/.metadata.json$/, '')
      metadata = JSON.parse(File.read(metadata_path))

      url = metadata['metadataAttributes']['url']
      puts "Scraping #{url}"

      system("node scrapePage.js -u #{url} -o #{output_path}")
    end
  end
end

# Upload HTML and metadata to KB
paths = Dir["#{OUTPUT_DIR}/*"]
paths.each do |path|
  file = File.open(path)
  data = file.read
  puts "Uploading #{path}"
  AWS::S3.upload_to_bucket(
    EMBEDDINGS_BUCKET,
    "live/#{File.basename(path)}",
    data,
    no_random: true
  )
  file.close
end
