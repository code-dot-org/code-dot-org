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
STRIPPED_ATTRS = ['id', 'inline'] + IGNORED_SOLUTION_BLOCK_ATTRS.keys

module SolutionBlocks
  extend ActiveSupport::Concern

  def strip_block(block)
    stripped_block = block.dup
    stripped_block.xpath(STRIPPED_NODES_XPATH).remove
    STRIPPED_ATTRS.each {|attr| stripped_block.remove_attribute(attr)}
    stripped_block.traverse do |node|
      node.content = node.content.strip if node.text?
    end
    return stripped_block.to_xml
  end

  def get_solution_blocks(create_for_toolbox=true)
    solution = Nokogiri::XML(properties['solution_blocks'])

    # flatten
    solution_blocks = solution.xpath('//block').to_a

    if create_for_toolbox
      # strip out blocks that shouldn't be in a toolbox
      solution_blocks.reject! { |block|
        IGNORED_SOLUTION_BLOCK_ATTRS.any? {|key, value| block.attr(key) == value}
      }
    end

    # sanitize
    solution_blocks.map!(&method(:strip_block))

    if create_for_toolbox
      # uniqueify and sort
      solution_blocks = solution_blocks.to_set.to_a.sort
    end

    solution_blocks
  end
end
