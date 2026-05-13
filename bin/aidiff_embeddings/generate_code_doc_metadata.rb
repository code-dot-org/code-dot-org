#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'
require 'fileutils'

OUTPUT_DIR = "#{Rails.root}/../bin/aidiff_embeddings/scrape-page/scrape_output/"
FileUtils.mkdir_p OUTPUT_DIR

EMBEDDINGS_BUCKET = 'cdo-ai-diff-production'

ProgrammingEnvironment.all.each do |programming_environment|
  lab = programming_environment.name

  programming_environment.programming_classes.all.each do |programming_class|
    key = programming_class.key
    metadata = {
      metadataAttributes: {
        lab:,
        url: "https://studio.code.org/docs/ide/#{lab}/classes/#{key}",
        verified_teacher: false
      }
    }

    File.write("#{OUTPUT_DIR}/programming_class_#{lab}_#{key}.html.metadata.json", metadata.to_json)
  end

  programming_environment.programming_expressions.all.each do |expression|
    key = expression.key
    metadata = {
      metadataAttributes: {
        lab:,
        url: "https://studio.code.org/docs/ide/#{lab}/expressions/#{key}",
        verified_teacher: false
      }
    }

    File.write("#{OUTPUT_DIR}/programming_expression_#{lab}_#{key}.html.metadata.json", metadata.to_json)
  end
end
