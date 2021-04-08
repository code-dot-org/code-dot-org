#!/usr/bin/env ruby
require 'csv'

FILENAME = ARGV[0].freeze

unless FILENAME
  puts <<~EOS
    Usage: #{$0} filename.csv
    Requirements:
      * the part of the filename before .csv is the framework shortcode.
      * the csv contains 3 columns, which will be interpreted as:
        parent category, category, standard
      * The csv file has a header row. The values in the header rown for the
        parent category and category columns will be used as the "category type"
        for these categories.
      * the first token in each cell is the shortcode and the rest is the description.
      * cells can be blank in the parent category and category columns. in this
        case, the most recent non-blank value for that column is reused.
  EOS
  exit(1)
end
framework_shortcode = FILENAME.split('/').last.split('.').first

Category = Struct.new(:framework, :parent, :category, :type, :description, keyword_init: true)
Standard = Struct.new(:framework, :category, :standard, :description, keyword_init: true)

parent_category_type = nil
category_type = nil

parent_categories = []
categories = []
standards = []

last_parent_category = nil
last_category = nil

# parse the input file, populating: parent_categories, categories, standards.
CSV.foreach(FILENAME) do |row|
  unless category_type
    raise "empty fields in header row: #{row.inspect}" unless row[0] && row[1]
    parent_category_type = row[0]
    category_type = row[1]
    next
  end

  # if the parent category or category is blank, use the previous value
  last_parent_category = row[0].strip || last_parent_category
  last_category = row[1].strip || last_category

  unless last_parent_category && last_category
    raise "first row must contain parent category and category: #{row.inspect}"
  end

  # assume each cell starts with a shortcode followed by a space
  parent_category_shortcode, parent_category_description = last_parent_category.split(' ', 2)
  category_shortcode, category_description = last_category.split(' ', 2)
  standard_shortcode, standard_description = row[2].strip.split(' ', 2)

  # create parent category if it does not exist already
  unless parent_categories.find {|pc| pc[:category] == parent_category_shortcode}
    parent_categories.push(
      Category.new(
        framework: framework_shortcode,
        parent: nil,
        category: parent_category_shortcode,
        type: parent_category_type,
        description: parent_category_description.strip
      )
    )
  end

  # create category if it does not exist already
  unless categories.find {|pc| pc[:category] == category_shortcode}
    categories.push(
      Category.new(
        framework: framework_shortcode,
        parent: parent_category_shortcode,
        category: category_shortcode,
        type: category_type,
        description: category_description.strip
      )
    )
  end

  # create standard unconditionally
  standards.push(
    Standard.new(
      framework: framework_shortcode,
      category: category_shortcode,
      standard: standard_shortcode,
      description: standard_description.strip
    )
  )
end

# assume location of output directory relative to the location of this file
directory = "#{__dir__}/../../dashboard/config/standards/"
categories_filename = "#{directory}#{framework_shortcode}_categories.csv"
standards_filename = "#{directory}#{framework_shortcode}_standards.csv"

# generate categories csv. parent categories must appear before categories
CSV.open(categories_filename, 'wb') do |csv|
  csv << categories.first.to_h.keys
  parent_categories.each do |pc|
    csv << pc.to_h.values
  end
  categories.each do |pc|
    csv << pc.to_h.values
  end
end

# generate standards csv
CSV.open(standards_filename, 'wb') do |csv|
  csv << standards.first.to_h.keys
  standards.each do |c|
    csv << c.to_h.values
  end
end
