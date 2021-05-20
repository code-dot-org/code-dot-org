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
      * The csv file has a header row. The values in the header row for the
        parent category and category columns will be used as the "category type"
        for these categories.
      * the first token in each cell is the shortcode and the rest is the description.
      * cells can be blank in the parent category and category columns. in this
        case, the most recent non-blank value for that column is reused.
  EOS
  exit(1)
end

FRAMEWORK_SHORTCODE = FILENAME.split('/').last.split('.').first

Category = Struct.new(:framework, :parent, :category, :type, :description, keyword_init: true)
Standard = Struct.new(:framework, :category, :standard, :description, keyword_init: true)

def main
  parent_categories, categories, standards = parse_csv_file(FILENAME)
  write_categories_csv(parent_categories, categories)
  write_standards_csv(standards)
end

# @param [String] filename A csv filename in format specified by usage info above
# @return [Array<Array<Category, Standard>>] Array containing parent categories,
#   categories, and standards.
def parse_csv_file(filename)
  parent_category_type = nil
  category_type = nil

  last_parent_category = nil
  last_category = nil

  parent_categories = []
  categories = []
  standards = []

  # parse the input file, populating parent_categories, categories, standards.
  CSV.foreach(filename) do |row|
    # use the header row to determine the display name for the parent category
    # and category within this framework
    unless category_type
      raise "empty fields in header row: #{row.inspect}" unless row[0] && row[1]
      parent_category_type = row[0]
      category_type = row[1]
      next
    end

    # if the parent category or category is blank, use the previous value
    last_parent_category = row[0]&.strip || last_parent_category
    last_category = row[1]&.strip || last_category
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
          framework: FRAMEWORK_SHORTCODE,
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
          framework: FRAMEWORK_SHORTCODE,
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
        framework: FRAMEWORK_SHORTCODE,
        category: category_shortcode,
        standard: standard_shortcode,
        description: standard_description.strip
      )
    )
  end

  [parent_categories, categories, standards]
end

def write_categories_csv(parent_categories, categories)
  # assume location of output directory relative to the location of this file
  directory = "#{__dir__}/../../dashboard/config/standards/"
  filename = "#{directory}#{FRAMEWORK_SHORTCODE}_categories.csv"

  # generate categories csv. parent categories must appear before categories
  CSV.open(filename, 'wb') do |csv|
    csv << categories.first.to_h.keys
    parent_categories.each do |pc|
      csv << pc.to_h.values
    end
    categories.each do |pc|
      csv << pc.to_h.values
    end
  end
end

def write_standards_csv(standards)
  # assume location of output directory relative to the location of this file
  directory = "#{__dir__}/../../dashboard/config/standards/"
  filename = "#{directory}#{FRAMEWORK_SHORTCODE}_standards.csv"

  # generate standards csv
  CSV.open(filename, 'wb') do |csv|
    csv << standards.first.to_h.keys
    standards.each do |c|
      csv << c.to_h.values
    end
  end
end

main
