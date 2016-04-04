require 'nokogiri'

IGNORED_SOLUTION_BLOCK_ATTRS = {
  'uservisible' => 'false',
  'deletable' => 'false',
  'editable' => 'false',
  'disabled' => 'true',
  'movable' => 'false'
}
NEW_CATEGORY_XML = '<category name="NEW BLOCKS"/>'
STRIPPED_NODES_XPATH = './next|./value|./statement|./title'
STRIPPED_ATTRS = %w(id inline) + IGNORED_SOLUTION_BLOCK_ATTRS.keys

module SolutionBlocks
  extend ActiveSupport::Concern

  def strip_block(block, toolbox_block=false, create_for_toolbox=false)
    stripped_block = block.dup
    stripped_block.xpath(STRIPPED_NODES_XPATH).remove
    stripped_block['type'] = stripped_block['type'].chomp '_dropdown' if toolbox_block
    STRIPPED_ATTRS.each {|attr| stripped_block.remove_attribute(attr)} unless create_for_toolbox
    stripped_block.content = stripped_block.content.strip
    return create_for_toolbox ? stripped_block : stripped_block.to_xml
  end

  def strip_toolbox_block(block)
    strip_block block, true
  end

  def create_toolbox_block(block)
    strip_block block, false, true
  end

  def blocks_match?(toolbox_block, solution_block)
    stripped_solution_block = strip_block(solution_block)
    # Return true for either an exact match, or a block in the solution with the
    # corresponding *_dropdown block in the toolbox
    stripped_solution_block == strip_block(toolbox_block) ||
      stripped_solution_block == strip_toolbox_block(toolbox_block)
  end

  # Add blocks to the toolbox that appear in the solution, but aren't already
  # in the toolbox
  def add_missing_toolbox_blocks
    toolbox = Nokogiri::XML(properties['toolbox_blocks'])
    toolbox_blocks = toolbox.xpath('//block')
    Nokogiri::XML(properties['solution_blocks']).xpath('//block').each do |block|
      next if IGNORED_SOLUTION_BLOCK_ATTRS.any? {|kvpair| block.attr(kvpair[0]) == kvpair[1]}

      next if toolbox_blocks.any? do |toolbox_block|
        blocks_match? toolbox_block, block
      end

      # Solution block does not appear in the toolbox, add it
      toolboxified_block = create_toolbox_block block
      if toolbox.xpath('//category').empty?
        toolbox.root = Nokogiri::XML::Node.new('xml', toolbox) if toolbox.root.nil?
        toolbox.root.add_child toolboxified_block
      else
        category = toolbox.xpath('//category[@name=\'NEW BLOCKS\']').first ||
          toolbox.xpath('//category').last.add_next_sibling(NEW_CATEGORY_XML).first
        category.add_child toolboxified_block
      end
      toolbox_blocks.push toolboxified_block
    end
    properties['toolbox_blocks'] =
      toolbox.to_xml save_with: Blockly::XML_OPTIONS
  end
end
