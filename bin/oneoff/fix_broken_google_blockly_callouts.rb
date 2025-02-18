#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'

DRY_RUN = true

# This script finds callouts written for CDO Blockly and adds duplicate versions of those
# callouts for Google Blockly. If the Google Blockly version already exists for the level,
# we don't add a new callout. This script can therefore be run multiple times on the same levels.
# It checks for callouts on flyouts (element id contains .svgFlyoutGroup),
# in the workspace (element id contains .svgGroup), and on toolbox
# categories (element id contains :*.label).
def fix_callouts
  if DRY_RUN
    puts "THIS IS A DRY RUN"
  else
    puts "THIS IS A FULL RUN"
  end
  puts "***PROCESSING ALL BLOCKLY LEVELS***"
  process_levels(Blockly.all)
  puts "***PROCESSING ALL GRID LEVELS***"
  process_levels(Grid.all)
  puts "***PROCESSING ALL MAZE LEVELS***"
  process_levels(Maze.all)
  puts "***PROCESSING ALL KAREL LEVELS***"
  process_levels(Karel.all)
  puts "***PROCESSING ALL STUDIO LEVELS***"
  process_levels(Studio.all)
  puts "***PROCESSING ALL STAR WARS GRID LEVELS***"
  process_levels(StarWarsGrid.all)
  puts "***PROCESSING ALL ARTIST LEVELS***"
  process_levels(Artist.all)
end

def process_levels(levels)
  fixed_count = 0
  could_not_fix_count = 0
  failed_count = 0
  svg_flyout_id_matcher = /\.svgFlyoutGroup \[block-id="(.*)"\]/
  blockly_flyout_id_matcher = /\.blocklyFlyout \[data-id="(.*)"\]/
  svg_ws_id_matcher = /\.svgGroup \[block-id="(.*)"\]/
  blockly_ws_id_matcher = /\.blocklySvg \[data-id="(.*)"\]/
  general_block_id_matcher = /\[block-id=['"]([^'"]+)['"]\]/
  general_data_id_matcher = /\[data-id=['"]([^'"]+)['"]\]/
  category_matcher = /\[id=':(.*)\.label'\]/
  fixed_category_matcher = /\[id='blockly-(.*)\.label'\]/
  levels.each do |level|
    next unless level.callout_json
    callouts = JSON.parse(level.callout_json)
    broken_block_ids = []
    broken_block_callouts = {}
    fixed_block_ids = []
    broken_category_ids = []
    broken_category_callouts = {}
    fixed_category_ids = []
    callouts.each do |callout|
      check_for_broken_callout(
        callout,
        svg_flyout_id_matcher,
        'blocklyFlyout',
        false,
        broken_block_ids,
        broken_block_callouts
      )
      check_for_broken_callout(
        callout,
        svg_ws_id_matcher,
        'blocklySvg',
        false,
        broken_block_ids,
        broken_block_callouts
      )
      check_for_broken_callout(
        callout,
        category_matcher,
        nil,
        true,
        broken_category_ids,
        broken_category_callouts
      )
      # This check needs to be last since it is less restrictive than those that provide a class.
      check_for_broken_callout(
        callout,
        general_block_id_matcher,
        false,
        false,
        broken_block_ids,
        broken_block_callouts
      )

      check_for_fixed_callout(callout, blockly_flyout_id_matcher, fixed_block_ids, false)
      check_for_fixed_callout(callout, blockly_ws_id_matcher, fixed_block_ids, false)
      check_for_fixed_callout(callout, fixed_category_matcher, fixed_category_ids, true)
      check_for_fixed_callout(callout, general_data_id_matcher, fixed_block_ids, false)
    end
    next if broken_block_ids.empty? && broken_category_ids.empty?
    block_ids_to_fix = broken_block_ids.difference(fixed_block_ids)
    category_ids_to_fix = broken_category_ids.difference(fixed_category_ids)
    next if block_ids_to_fix.empty? && category_ids_to_fix.empty?
    puts "***Updating #{block_ids_to_fix.length + category_ids_to_fix.length} callouts on #{level.name}***"
    add_new_callouts(block_ids_to_fix, broken_block_callouts, callouts)
    add_new_callouts(category_ids_to_fix, broken_category_callouts, callouts)
    if add_ids_to_blocks(block_ids_to_fix, level, broken_block_callouts)
      level.callout_json = JSON.generate(callouts)
      fixed_count += 1
      unless DRY_RUN
        level.save!(touch: false)
      end
    else
      puts "Could not update #{level.name}"
      could_not_fix_count += 1
    end
  rescue => exception
    puts "Failed on #{level.name} with error #{exception.message}"
    failed_count += 1
  end
  puts "Fixed #{fixed_count} levels, could not fix #{could_not_fix_count} levels, failed on #{failed_count} levels"
end

def add_new_callouts(ids_to_fix, broken_callouts, callouts)
  ids_to_fix.each do |broken_id|
    callout = broken_callouts[broken_id][:callout]
    new_callout = {
      element_id: broken_callouts[broken_id][:new_element_id],
      localization_key: callout['localization_key'],
      callout_text: callout['callout_text'],
      qtip_config: callout['qtip_config'],
      on: callout['on']
    }
    callouts << new_callout
  end
end

def check_for_broken_callout(callout, element_id_matcher, new_css_class, is_category, broken_block_ids, broken_callouts)
  element_id = callout['element_id']
  match_data = element_id.match(element_id_matcher)
  if match_data
    broken_id = match_data[1]
    # This is needed so we don't process the same callout multiple times. For example, an element_id could match
    # both svg_flyout_id_matcher and general_block_id_matcher. We'll stop here if we've already found the first one.
    unless broken_block_ids.include?(broken_id)
      broken_block_ids.push(broken_id)
      new_element_id = if is_category
                         new_id_for_category(broken_id)
                       else
                         new_id_for_block(new_css_class, broken_id, element_id)
                       end
      broken_callouts[broken_id] = {callout: callout, new_element_id: new_element_id}
    end
  end
end

def new_id_for_block(new_css_class, id, element_id)
  if new_css_class
    ".#{new_css_class} [data-id=\"#{id}\"]"
  else
    # For the general_block_id_matcher, we simply replace block-id with data-id.
    # We copy the old element so we don't lose other trailing selector information.
    modified_id = element_id.dup
    modified_id.sub!('block-id', 'data-id')
    # Special case to modify selection of function call block's edit button
    modified_id.sub!('.blocklyIconGroup', 'g>.blocklyFieldRect')
    modified_id
  end
end

def new_id_for_category(old_id)
  # Old categories were 1 indexed, new categories are 0 indexed.
  new_id = old_id.to_i - 1
  "[id='blockly-#{new_id}.label']"
end

def check_for_fixed_callout(callout, element_id_matcher, fixed_block_ids, is_category)
  fixed_match_data = callout['element_id'].match(element_id_matcher)
  if fixed_match_data
    fixed_id = fixed_match_data[1]
    if is_category
      # Category indexing changed from 1 indexing to 0 indexing.
      fixed_id = (fixed_id.to_i + 1).to_s
    end
    fixed_block_ids.push(fixed_id)
  end
end

def add_ids_to_blocks(ids_to_add, level, broken_callouts)
  toolbox_xml = Nokogiri::XML(level.toolbox_blocks)
  start_blocks_xml = Nokogiri::XML(level.start_blocks)
  long_instructions_block_count = level.long_instructions&.scan('<block')&.count || 0
  existing_ids = []
  # Find all existing ids on blocks. If the id we are looking for already exists, don't add it.
  find_existing_ids(toolbox_xml.xpath('//*'), existing_ids)
  find_existing_ids(start_blocks_xml.xpath('//*'), existing_ids)
  ids_to_add = ids_to_add.difference(existing_ids)
  # This xpath syntax ignores namespaces, which some xml nodes use.
  toolbox_blocks = toolbox_xml.xpath("*[local-name()='xml']//*[local-name()='block']")
  category_blocks = toolbox_xml.xpath("*[local-name()='xml']//*[local-name()='category']")
  start_blocks = start_blocks_xml.xpath("*[local-name()='xml']//*[local-name()='block']")
  all_blocks = start_blocks + toolbox_blocks
  could_match = true
  ids_to_add.each do |id_to_add|
    callout_data = broken_callouts[id_to_add]
    is_toolbox_block = callout_data[:new_element_id].include? 'blocklyFlyout'
    is_start_block = callout_data[:new_element_id].include? 'blocklySvg'
    if is_toolbox_block
      index = category_blocks.empty? ? id_to_add.to_i - 1 : id_to_add.to_i - start_blocks.length - 1 - long_instructions_block_count
      if toolbox_blocks.length <= index
        puts "#{level.name} INVALID TOOLBOX INDEX #{id_to_add}"
        could_match = false
      elsif toolbox_blocks[index]['id']
        # If the block already has an id, we can't add a new one. Fail this update.
        puts "#{level.name} Toolbox block with index #{id_to_add} already has id #{toolbox_blocks[index]['id']}"
        could_match = false
      else
        toolbox_blocks[index]['id'] = id_to_add
      end
    elsif is_start_block
      index = category_blocks.empty? ? id_to_add.to_i - toolbox_blocks.length - 1 - long_instructions_block_count : id_to_add.to_i - 1 - long_instructions_block_count
      if start_blocks.length <= index
        puts "#{level.name} INVALID START_BLOCKS INDEX #{id_to_add}"
        could_match = false
      elsif start_blocks[index]['id']
        # If the block already has an id, we can't add a new one. Fail this update.
        puts "#{level.name} Start block with index #{id_to_add} already has id #{start_blocks[index]['id']}"
        could_match = false
      else
        start_blocks[index]['id'] = id_to_add
      end
    else # The specific type of block (toolbox or start) isn't clear
      index = id_to_add.to_i - 1
      if index < 0 || index >= all_blocks.length
        puts "#{level.name} INVALID BLOCK INDEX #{id_to_add}"
        could_match = false
      elsif all_blocks[index]['id']
        # If the block already has an id, we can't add a new one. Fail this update.
        puts "#{level.name} Block with index #{id_to_add} already has id #{all_blocks[index]['id']}"
        could_match = false
      else
        all_blocks[index]['id'] = id_to_add
      end
    end
  end
  if could_match
    level.toolbox_blocks = toolbox_xml.serialize(save_with: Nokogiri::XML::Node::SaveOptions::NO_DECLARATION).strip
    level.start_blocks = start_blocks_xml.serialize(save_with: Nokogiri::XML::Node::SaveOptions::NO_DECLARATION).strip
    return true
  end
  return false
end

def find_existing_ids(blocks, ids)
  blocks.each do |block|
    if block['id']
      ids << block['id']
    end
  end
end

fix_callouts
