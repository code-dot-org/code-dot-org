# == Schema Information
#
# Table name: quiz_questions
#
#  id             :bigint           not null, primary key
#  type           :string(255)      not null
#  key            :string(36)       not null
#  fork_parent_id :bigint
#  name           :string(255)      not null
#  content        :json             not null
#  explanation    :text(65535)
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_quiz_questions_on_created_at  (created_at)
#  index_quiz_questions_on_key         (key)
#  index_quiz_questions_on_name        (name)
#
class MatchQuestion < QuizQuestion
  # Pair each item in one set with its partner in the other. Items are
  # matched one-to-one.
  #
  # `content` shape:
  #   {
  #     "question_title" => "Match each AI tool to the task it is best suited for.",
  #     "description" => "Markdown shown under the title. Optional.",
  #     "pairs" => [
  #       {"id" => "p1", "items" => [{"id" => "k3f", "text" => "Image classifier"},
  #                                  {"id" => "9qz", "text" => "Sorting photos into categories"}]},
  #       ...
  #     ]
  #   }
  #
  # Students see each pair's first item in one set and its second item in the
  # other, so item ids must not reveal which items are paired.
  validate :validate_question_shape

  def auto_gradable?
    true
  end

  # response_data shape: {"pairs" => [["k3f", "9qz"], ...]}
  def answered?(response_data)
    response_data['pairs'].is_a?(Array) && response_data['pairs'].any?
  end

  # All or nothing: correct only if exactly the correct pairs are given.
  def grade(response_data)
    pairs = response_data.is_a?(Hash) ? response_data['pairs'] : nil
    correct = pairs.is_a?(Array) &&
      pairs.all? {|p| p.is_a?(Array) && p.length == 2} &&
      # Handles any order of pairs, as well as any order of ids within each pair.
      pairs.to_set(&:to_set) == correct_pairs.to_set(&:to_set)
    {score: correct ? 1 : 0, max_score: 1}
  end

  def self.content_from_builder_params(params)
    shared_content_from_builder_params(params).merge(
      pairs: (params[:pairs] || []).map(&:to_h),
    )
  end

  def placeholder_content
    {
      'question_title' => "Placeholder question #{key} - encryption key missing",
      'pairs' => [
        {'id' => 'p1', 'items' => [{'id' => 'a', 'text' => 'Placeholder item A'}, {'id' => 'x', 'text' => 'Placeholder match A'}]},
        {'id' => 'p2', 'items' => [{'id' => 'b', 'text' => 'Placeholder item B'}, {'id' => 'y', 'text' => 'Placeholder match B'}]},
      ],
    }
  end

  def answer_key_json
    {correctPairs: correct_pairs}
  end

  def builder_content_json
    shared_content_json.merge(pairs: content['pairs'])
  end

  def attempt_content_json
    first_items = content['pairs'].map {|p| p['items'][0]}
    second_items = content['pairs'].map {|p| p['items'][1]}
    shared_content_json.merge(matchSets: [first_items.shuffle, second_items.shuffle])
  end

  private def correct_pairs
    content['pairs'].map {|p| p['items'].map {|i| i['id']}}
  end

  private def validate_question_shape
    # Blank content already fails QuizQuestion's presence validation.
    return if content.blank?
    q = content.deep_stringify_keys
    validate_shared_content(q)

    pairs = q['pairs']
    unless pairs.is_a?(Array) && pairs.length >= 2
      errors.add(:content, 'must have at least 2 "pairs"')
      return
    end

    unless pairs.all? {|p| p.is_a?(Hash) && p['id'].is_a?(String) && p['id'].present? && p['items'].is_a?(Array) && p['items'].length == 2}
      errors.add(:content, 'each pair must have a non-blank "id" and exactly 2 "items"')
      return
    end

    pair_ids = pairs.map {|p| p['id']}
    unless pair_ids.uniq.length == pair_ids.length
      errors.add(:content, 'pair ids must be unique')
      return
    end

    # Unique across the whole question, not just within a pair, so a response
    # pair identifies its two items unambiguously.
    validate_items(pairs.flat_map {|p| p['items']}, 'item')
  end
end
