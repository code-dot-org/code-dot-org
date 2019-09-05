# == Schema Information
#
# Table name: levels
#
#  id                    :integer          not null, primary key
#  game_id               :integer
#  name                  :string(255)      not null
#  created_at            :datetime
#  updated_at            :datetime
#  level_num             :string(255)
#  ideal_level_source_id :integer          unsigned
#  user_id               :integer
#  properties            :text(65535)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#
# Indexes
#
#  index_levels_on_game_id  (game_id)
#  index_levels_on_name     (name)
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

  def icon
    'fa fa-list-ul'
  end

  # Returns a flattened array of all the Levels in this LevelGroup, in order.
  def levels
    level_names = []
    properties["pages"].each do |page|
      page["levels"].each do |page_level_name|
        level_names << page_level_name
      end
    end

    Level.where(name: level_names).sort_by {|l| level_names.index(l.name)}
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

  def assign_attributes(params)
    @pages = nil
    super(params)
  end

  def plc_evaluation?
    levels.map(&:class).uniq == [EvaluationMulti]
  end

  # Surveys: How many students must complete a survey before any results are shown.
  SURVEY_REQUIRED_SUBMISSION_COUNT = 5

  # Perform a deep copy of this level by cloning all of its sublevels
  # using the same suffix, and write them to the new level definition file.
  def clone_with_suffix(new_suffix, editor_experiment: nil)
    new_name = "#{base_name}#{new_suffix}"
    return Level.find_by_name(new_name) if Level.find_by_name(new_name)

    level = super(new_suffix, editor_experiment: editor_experiment)
    level.clone_sublevels_with_suffix(new_suffix)
    level.rewrite_dsl_file(LevelGroupDSL.serialize(level))
    level
  end

  # Clone the sublevels, adding the specified suffix to the level name. Also
  # updates this level to reflect the new level names.
  def clone_sublevels_with_suffix(new_suffix)
    new_properties = properties

    if new_properties['texts']
      new_properties['texts'].map! do |text|
        new_level = Level.find_by_name(text['level_name']).clone_with_suffix(new_suffix)
        text['level_name'] = new_level.name
        text
      end
    end

    if new_properties['pages']
      new_properties['pages'].map! do |page|
        page['levels'].map! do |level_name|
          new_level = Level.find_by_name(level_name).clone_with_suffix(new_suffix)
          new_level.name
        end
        page
      end
    end

    update!(properties: new_properties)
  end

  # Surveys: Given a sublevel, and the known response string to it, return a result hash.
  def self.get_sublevel_result(sublevel, sublevel_response)
    sublevel_result = {}
    if sublevel_response
      case sublevel
      when TextMatch, FreeResponse
        sublevel_result[:result] = sublevel_response
      when Multi
        student_result = sublevel_response.split(",").sort.join(",")
        # unless unsubmitted
        unless student_result == "-1"
          sublevel_result[:answer_index] = student_result.to_i
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
                      sublevel.properties.try(:[], "long_instructions")

      # Go through each student, and make sure to shuffle their results for additional
      # anonymity.
      results = section.students.map do |student|
        # Skip student if they haven't submitted for this LevelGroup.
        user_level = student.user_level_for(script_level, script_level.level)
        next unless user_level.try(:submitted)

        get_sublevel_result(sublevel, student.last_attempt(sublevel).try(:level_source).try(:data))
      end.compact.shuffle

      answers = sublevel.properties.try(:[], "answers")
      answer_texts = answers.map {|answer| answer["text"]} if answers

      {
        type: sublevel.type.underscore,
        question: question_text,
        results: results,
        answer_texts: answer_texts
      }
    end
  end

  # Surveys: Returns all anonymous survey results, given a script and a section.
  #
  # The results look like this.  For each level_group_id, levelgroup_results is an array
  # wih an entry per contained sublevel.  Inside each entry is an array of results
  # which has been shuffled to increase student anonymity.  There is an entry for each
  # student who has submitted the overall LevelGroup, whether they have given a valid
  # answer to that sublevel question or not, which explains the empty hashes
  # intermingled with real results.
  # [ 23432:
  #   { stage_name: "Stage 30: Anonymous student survey",
  #     levelgroup_results: [
  #       {
  #         type: "multi",
  #         question: "Computer science is fun",
  #         results: [
  #           {answer_index: 0},
  #           {},
  #           {answer_index: 0}],
  #         answer_texts: ["Agree", "Disagree", "Not sure"]}},
  #       {
  #         type: "free_response",
  #         question: "Why are you doing this class?  Give at least two reasons.",
  #         results: [
  #           {result: ""},
  #           {result: "I like making games, and I also like the lifestyle."},
  #           {}]}]}]
  def self.get_summarized_survey_results(script, section)
    level_group_script_levels = script.script_levels.select do |sl|
      sl.levels.first.is_a?(LevelGroup) && sl.long_assessment? && sl.anonymous?
    end

    surveys_by_level_group = {}

    # Go through each anonymous long-assessment LevelGroup.
    level_group_script_levels.each do |script_level|
      level_group = script_level.levels[0]
      levelgroup_results = get_levelgroup_survey_results(script_level, section).
        each_with_index do |result, index|
          result[:question_index] = index
        end

      # We will have results, even empty ones, for each student that submitted
      # an answer.
      student_count = levelgroup_results.empty? ? 0 : levelgroup_results.first[:results].length

      # Don't report any results if not enough students have submitted the survey.
      reportable_results = student_count < SURVEY_REQUIRED_SUBMISSION_COUNT ? [] : levelgroup_results

      # All the results for one LevelGroup for a group of students.
      surveys_by_level_group[level_group.id] = {
        stage_name: script_level.stage.localized_title,
        levelgroup_results: reportable_results
      }
    end

    surveys_by_level_group
  end

  # @param {User} current_user - The currently signed in user
  # @param {User} user - The optional user we're trying to see the attempt of
  # @param {Level} level - The sublevel we'd like the last attempt for
  def self.get_sublevel_last_attempt(current_user, user, level, script)
    # if given an alternative user, we want to show that user's solution (for
    # teachers viewing students' solutions), otherwise show that of the current_user
    (user || current_user).
      try(:last_attempt, level, script).
      try(:level_source).
      try(:data)
  end
end
