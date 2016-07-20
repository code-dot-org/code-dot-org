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

  # Surveys: How many students must complete a survey before any results are shown.
  SURVEY_REQUIRED_SUBMISSION_COUNT = 5

  # Surveys: Given a sublevel, and the known response string to it, return a result hash.
  def self.get_sublevel_result(sublevel, sublevel_response)
    sublevel_result = {}
    if sublevel_response
      case sublevel
      when TextMatch, FreeResponse
        sublevel_result[:result] = sublevel_response
        sublevel_result[:type] = "free_response"
      when Multi
        student_result = sublevel_response.split(",").sort.join(",")
        # unless unsubmitted
        unless student_result == "-1"
          answer_text = sublevel.properties.try(:[], "answers").try(:[], student_result.to_i).try(:[], "text")
          sublevel_result[:result_text] = answer_text
          # Convert "0,1,3" to "A, B, D" for teacher-friendly viewing
          sublevel_result[:result] = student_result.split(',').map{ |k| Multi.value_to_letter(k.to_i) }.join(', ')
          sublevel_result[:type] = "multi"
        end
      end
    end
    sublevel_result
  end

  # Returns survey results for a single LevelGroup level by students in a single section.
  def self.get_levelgroup_survey_results(script_level, section)
    # Go through each sublevel
    script_level.level.levels.map do |sublevel|
      question_text = sublevel.properties.try(:[], "questions").try(:[], 0).try(:[], "text") ||
                      sublevel.properties.try(:[], "markdown_instructions")

      # Go through each student, and make sure to shuffle their results for additional
      # anonymity.
      results = section.students.map do |student|
        # Skip student if they haven't submitted for this LevelGroup.
        user_level = student.user_level_for(script_level, script_level.level)
        next unless user_level.try(:submitted)

        get_sublevel_result(sublevel, student.last_attempt(sublevel).try(:level_source).try(:data))
      end.compact.shuffle

      {
        question: question_text,
        results: results
      }
    end
  end

  # Surveys: Returns all anonymized survey results, given a script and a section.
  #
  # The results look like this.  For each LevelGroup, levelgroup_results is an array
  # wih an entry per contained sublevel.  Inside each entry is an array of results
  # which has been shuffled to increase student anonymity.  There is an entry for each
  # student who has submitted the overall LevelGroup, whether they have given a valid
  # answer to that sublevel question or not, which explains the empty hashes
  # intermingled with real results.
  # [
  #   { stage: "Stage 30: Anonymous student survey",
  #     puzzle: 1,
  #     levelgroup_results: [
  #       {
  #         results: [
  #           {result_text: "Strongly agree", result: "A", type: "multi"},
  #           {},
  #           {result_text: "Strongly agree", result: "A", type: "multi"}] },
  #         question: "Computer science is fun." },
  #       {
  #         results:
  #           {result: "", type: "free_response"},
  #           {result: "I like making games, and I also like the lifestyle.", type: "free_response"},
  #           {}],
  #         question: "Why are you doing this class?  Give at least two reasons."}}}]
  #

  def self.get_survey_results(script, section)
    level_group_script_levels = script.script_levels.includes(:levels).where('levels.type' => LevelGroup)

    # Go through each anonymous long-assessment LevelGroup.
    level_group_script_levels.map do |script_level|
      next unless script_level.long_assessment?
      next unless script_level.anonymous?

      levelgroup_results = get_levelgroup_survey_results(script_level, section)

      # We will have results, even empty ones, for each student that submitted
      # an answer.
      student_count = levelgroup_results.empty? ? 0 : levelgroup_results.first[:results].length

      if student_count >= SURVEY_REQUIRED_SUBMISSION_COUNT
        # All the results for one LevelGroup for a group of students.
        {
          stage: script_level.stage.localized_title,
          puzzle: script_level.position,
          levelgroup_results: levelgroup_results
        }
      else
        nil
      end
    end.compact
  end

end
