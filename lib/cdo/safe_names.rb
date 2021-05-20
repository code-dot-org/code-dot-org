require 'active_support/core_ext/object/try'
require 'active_support/core_ext/object/blank'
require 'rambling-trie'

module SafeNames
  # Return a sorted collection of models that represent users in which all names are
  # shortened to their first name (if unique) or their first name plus
  # the minimum number of letters in their last name needed to uniquely
  # identify them.
  # @param collection [Enumerable] collection of models (usually ActiveRecord::Relation) to process
  # @param first_last_name_proc [Proc] proc that takes an item in the collection and
  #   returns a tuple of [first_name, last_name]
  # @return [Array<Array<String, Object>>] Array of tuples representing the safe name and associated item
  #   from the original collection, sorted by safe name
  def self.get_safe_names(collection, first_last_name_proc)
    # Create a prefix tree of student names
    trie = Rambling::Trie.create

    item_descriptions = []
    collection.each do |item|
      first_name, last_name = first_last_name_proc.call(item).map {|n| n.try(:strip)}
      full_name = "#{first_name} #{last_name}".strip

      trie.add full_name
      item_descriptions << {full_name: full_name, item: item, first_name: first_name}
    end

    # Count cases of each first name to check first-name uniqueness
    # {"Aaron" => 2, "Bey" => 1, "Chloe" => 1, ...}
    first_name_counts = item_descriptions.group_by {|item| item[:first_name]}.transform_values(&:count)

    # Determine safe names for each item, map to an array of tuples (safe_name, item), and sort by safe_name
    item_descriptions.map do |item_description|
      [determine_safe_name(trie, first_name_counts, item_description), item_description[:item]]
    end.sort_by(&:first)
  end

  def self.determine_safe_name(trie, first_name_counts, item_description)
    first_name = item_description[:first_name]
    full_name = item_description[:full_name]

    # No first name? Use full name
    return full_name if first_name.blank?

    # If the first name is either a single character or a
    # single character followed by a period, assume it has been
    # abbreviated and use the full name
    return full_name if first_name.length == 1 || /^.\.$/.match(first_name)

    # If the first name is unique among first names, only use the first name.
    # Or - if the first name is not unique but it appears unique in the trie (which is a set)
    # we have identical full names, and should only use the first name.
    return first_name if first_name_counts[first_name] == 1 || trie.words(first_name).count == 1

    # Otherwise, we first must find the leaf node representing the entire name
    leaf = trie.root
    full_name.each_char do |letter|
      leaf = leaf[letter.to_sym]
    end

    # We then traverse up the trie until we encounter the
    # "rightmost" letter in the name which is not unique.
    # "Not unique" means that either the letter has siblings
    # (implying other names that share characters with our own) or
    # its parent is a terminal node (implying a name that's a strict
    # subset of our own)
    leaf = leaf.parent until leaf.parent.nil? ||
      leaf.parent.children.count > 1 ||
      leaf.parent.terminal?

    # If our "rightmost" character is a space, add an additional
    # letter for visibility if we can. Note that by this stage we
    # are guaranteed to have no more than one child, so we can
    # confidently pick the first.
    leaf = leaf.children.first if leaf.children.any? && leaf.letter == :' '

    # Finally, we assemble the unique name by continuing
    # our way up the trie
    safe_name = ''
    until leaf.nil?
      safe_name = leaf.letter.to_s + safe_name
      leaf = leaf.parent
    end

    safe_name.presence || full_name
  end
end
