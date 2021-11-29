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
#  ideal_level_source_id :bigint           unsigned
#  user_id               :integer
#  properties            :text(16777215)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#
# Indexes
#
#  index_levels_on_game_id    (game_id)
#  index_levels_on_level_num  (level_num)
#  index_levels_on_name       (name)
#

class LevelGroup < DSLDefined
  serialized_attrs %w(
    levels_and_texts_per_page
  )

  def dsl_default
    <<~ruby
      name '#{DEFAULT_LEVEL_NAME}'
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

  # Returns an array of all the levels and texts in this LevelGroup,
  # in order.
  def levels_and_texts
    pages.map(&:levels_and_texts).flatten
  end

  # Returns an array of all the levels in this LevelGroup, in order.
  def levels
    pages.map(&:levels).flatten
  end

  class LevelGroupPage
    def initialize(page_number, levels_and_texts_offset, levels_and_texts, levels_offset)
      @page_number = page_number
      @levels_and_texts_offset = levels_and_texts_offset
      @levels_and_texts = levels_and_texts
      @levels_offset = levels_offset
    end

    attr_reader :page_number
    attr_reader :levels_and_texts_offset
    attr_reader :levels_and_texts
    attr_reader :levels_offset

    def levels
      levels_and_texts.reject {|l| l.is_a?(External)}
    end

    def texts
      levels_and_texts.select {|l| l.is_a?(External)}
    end
  end

  # Returns an array of LevelGroupPage objects, each of which contains:
  #   page_number: the 1-based page number (corresponding to the /page/X URL).
  #   levels_and_texts_offset: the count of levels and texts on prior pages.
  #   levels_and_texts: an array of levels and texts on this page.
  #   levels_offset: the count of levels on prior pages.
  #   levels: an array of levels on this page.
  #   texts: an array of texts on this page.
  #
  # In this context, a "level" is a Level object of one of the following types:
  #   multi match text_match free_response evaluation_multi
  # These "levels" contain questions which the end user can answer.
  #
  # A "text" is a Level object of type external. These show text on
  # the page but do not accept an answer and are excluded from numbering.
  #
  # Under the hood, "levels" and "texts" are both referred to as "sublevels",
  # which live in the parent_levels_child_levels table.

  def pages
    levels_and_texts_offset = 0
    levels_offset = 0
    return @pages if @pages
    all_levels_and_texts = child_levels.all
    @pages = properties['levels_and_texts_per_page'].map.with_index do |page_size, page_index|
      page_number = page_index + 1
      levels_and_texts = all_levels_and_texts[levels_and_texts_offset..(levels_and_texts_offset + page_size - 1)]
      page_object = LevelGroupPage.new(page_number, levels_and_texts_offset, levels_and_texts, levels_offset)
      levels_and_texts_offset += page_size
      levels_offset += page_object.levels.length
      page_object
    end
  end

  def self.setup(data)
    level = super(data)

    levels_and_texts_by_page = data[:pages].map do |page|
      page[:levels].map do |level_name|
        Level.find_by_name!(level_name)
      end
    end
    level.update_levels_and_texts_by_page(levels_and_texts_by_page)

    level
  end

  # @param [Array] new_levels_and_texts_by_page A 2D array of levels and texts,
  # e.g. [[Multi<id:1>, Match<id:2>],[External<id:4>,FreeResponse<id:4>]]
  def update_levels_and_texts_by_page(new_levels_and_texts_by_page)
    reload
    self.child_levels = []
    new_levels = new_levels_and_texts_by_page.flatten
    new_levels.each_with_index do |level, level_index|
      ParentLevelsChildLevel.find_or_create_by!(
        parent_level: self,
        child_level: level,
        position: level_index + 1
      )
    end

    self.levels_and_texts_per_page = []
    @pages = nil
    new_levels_and_texts_by_page.each do |levels_and_texts_by_page|
      levels_and_texts_per_page.push(levels_and_texts_by_page.count)
    end
    save!
  end

  def get_levels_and_texts_by_page
    pages.map(&:levels_and_texts)
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
    level.clone_sublevels_with_suffix(get_levels_and_texts_by_page, new_suffix)
    level.rewrite_dsl_file(LevelGroupDSL.serialize(level))
    level
  end

  # Clone the sublevels, adding the specified suffix to the level name. Also
  # updates this level to reflect the new level names.
  # @param [Array[Array[Level]]] A 2D array of levels and texts, e.g.
  # e.g. [[Multi<id:1>, Match<id:2>],[External<id:4>,FreeResponse<id:4>]]
  def clone_sublevels_with_suffix(old_levels_and_texts_by_page, new_suffix)
    new_levels_and_texts_by_page = old_levels_and_texts_by_page.map do |levels_and_texts|
      levels_and_texts.map {|level| level.clone_with_suffix(new_suffix)}
    end
    update_levels_and_texts_by_page(new_levels_and_texts_by_page)
  end

  # @override
  def all_child_levels
    child_levels.all
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
        user_level = UserLevel.find_by(
          user: student,
          script: script_level.script,
          level: script_level.level
        )
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
  #   { lesson_name: "Lesson 30: Anonymous student survey",
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
        lesson_name: script_level.lesson.localized_title,
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
