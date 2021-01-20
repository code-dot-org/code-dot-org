#!/usr/bin/env ruby

require 'json'
require_relative '../../deployment'
require_relative '../../dashboard/config/environment'

FIELDS_BY_MODEL = {
  LessonGroup => %w(description big_questions),
  Lesson => %w(overview student_overview purpose preparation assessment_opportunities),
  ActivitySection => %w(description),
  Objective => %w(description),

  # possibly unnecessary:
  Resource => %w(name type),
  Vocabulary => %w(definition),
}

def serialize_model_data(model, fields)
  data = {}
  all_fields = fields.concat(%w(name)).sort.uniq

  model.all.each do |object|
    data[object.id] = all_fields.reduce({}) do |accum, field|
      value = object.try(field)
      accum[field] = value unless value.nil?
      accum
    end

    if model == ActivitySection
      data[object.id]["tips"] = object.tips.map {|t| t["markdown"]} unless object.tips.blank?
    end

    data.delete(object.id) if data[object.id].empty? || data[object.id].keys == ["name"]
  end

  File.write("/tmp/cb_markdown/#{model.name}.json", JSON.pretty_generate(data))
end

def main
  FIELDS_BY_MODEL.each do |model, fields|
  end
end

main
