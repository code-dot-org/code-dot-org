# == Schema Information
#
# Table name: levels
#
#  id                       :integer          not null, primary key
#  game_id                  :integer
#  name                     :string(255)      not null
#  created_at               :datetime
#  updated_at               :datetime
#  level_num                :string(255)
#  ideal_level_source_id    :integer
#  solution_level_source_id :integer
#  user_id                  :integer
#  properties               :text(65535)
#  type                     :string(255)
#  md5                      :string(255)
#  published                :boolean          default(FALSE), not null
#  notes                    :text(65535)
#
# Indexes
#
#  index_levels_on_game_id  (game_id)
#

class LevelGroup < DSLDefined

  def dsl_default
    <<ruby
name 'unique level name here'
title 'title of the assessment here'
submittable 'true'
anonymous 'false'

page
level 'level1'
level 'level2'

page
level 'level 3'
level 'level 4'
ruby
  end

  # Returns a flattened array of all the Levels in this LevelGroup, in order.
  def levels
    level_names = []
    properties["pages"].each do |page|
      page["levels"].each do |page_level_name|
        level_names << page_level_name
      end
    end

    Level.where(name: level_names).sort_by{ |l| level_names.index(l.name) }
  end

  class LevelGroupPage
    def initialize(page_properties, page_number, offset)
      @levels = []
      page_properties["levels"].each do |level_name|
        level = Level.find_by_name(level_name)
        @levels << level
      end
      @offset = offset
      @page_number = page_number
    end

    attr_reader :levels
    attr_reader :page_number
    attr_reader :offset
  end

  # Returns an array of pages LevelGroupPage objects, each of which contains:
  #   levels: an array of Levels.
  #   page_number: the 1-based page number (corresponding to the /page/X URL).
  #   page_offset: the count of questions occurring on prior pages.

  def pages
    offset = 0
    page_count = 0
    @pages ||= properties['pages'].map do |page|
      page_count += 1
      page_object = LevelGroupPage.new(page, page_count, offset)
      offset += page_object.levels.count
      page_object
    end
  end

  def plc_evaluation?
    levels.map(&:class).uniq == [EvaluationMulti]
  end
end
