require 'json'

require_relative 'constants'

INDENTED_BLOCKS = ['repeat', 'play_together']

def validate_music(path, options = {})
  manifest_path = File.join(File.dirname(__FILE__), "manifest.json")
  data = JSON.parse(File.read(manifest_path))

  # Get possible sounds for the different packs
  sounds = data['packs'].map {|pack| [pack['id'], pack['sounds'].filter {|sound| sound['type'] != 'preview'}.map {|sound| sound['src']}]}.to_h

  drum_packs = data['packs'].filter {|pack| pack['artist'] == 'Code.org' || pack['artist'].nil?}.map {|pack| pack['id']}

  # Get pack name from filename
  name = File.basename(path)
  pack = name.split('-').first

  drums = name.split('-')[4]
  if drums == 'original'
    drums = pack
  end

  # Detect adlib type
  is_layers = LAYERS.map {|layer| layer.split(':').first}.include?(name.split('-')[2])

  valid_packs = if is_layers
                  [pack, *drum_packs]
                else
                  [pack, drums]
                end

  # Read the file
  # and parse data for errors
  error = false
  last_block = nil
  last_indent = 0

  # The current indentation of the play together
  within_play_together = -1
  play_together_sounds = []

  # The 'fixed' file content
  result = []

  File.readlines(path).each_with_index do |line, i|
    result << line
    indent = (line.match(/^\s+/) || [])[0]&.length || 0
    line = line.strip
    if line == ''
      # Empty line is acceptable
      next
    end

    # look for when_run as the first line
    if i == 0
      if line != 'when_run'
        error = "No when_run"
        break
      end

      if indent != 0
        error = "when_run is indented when it shouldn't be"
        break
      end

      last_block = 'when_run'
      last_indent = 0
      next
    end

    if indent < 2
      error = "non-starting line isn't indented"
      break
    end

    # Escaping the play together block
    if indent != within_play_together
      within_play_together = -1
      play_together_sounds = []
    end

    # Check arguments
    block, *args = line.split

    case block
    when 'play'
      # Argument should be a quoted string with either the pack name
      # or a drum from the given set (for adlib 2)
      if args.empty?
        error = "'play' has no arguments"
      elsif args.length > 1
        error = "'play' has too many arguments"
      else
        arg = args.first

        unless arg.start_with?('"') && arg.end_with?('"')
          error = "'play' does not have a quoted argument"
          break
        end

        parts = arg[1..-2].split('/')

        if parts.length != 2
          error = "'play' argument has no pack or sound specified"
        elsif !valid_packs.include?(parts.first)
          error = "'play' argument has an invalid pack specified: #{parts.first}"
        elsif !(sounds[parts.first] || []).include?(parts.last)
          error = "'play' argument has an invalid sound specified: #{parts.join('/')}"
        else
          if indent == within_play_together
            if play_together_sounds.include?(arg)
              if options[:fix]
                # Remove this line
                result.pop
              else
                error = "'play_together' has a repeated sound: #{parts.join('/')}"
              end
            else
              play_together_sounds << arg
            end
          end
        end
      end
    when 'play_together'
      # There are no arguments
      unless args.empty?
        error = "'play_together' block has arguments"
      end

      # Cannot be within another play_together
      if within_play_together > 0
        error = "'play_together' within another play_together block"
      end

      within_play_together = indent + 2
      play_together_sounds = []
    when 'repeat'
      # Layered output cannot have a 'repeat' block
      error = "'repeat' exists within a layered output" if is_layers

      # The argument is a number
      unless args.length == 1 && args.first.match(/^\d+$/)
        error = "'repeat' either has no arguments or not a number: #{args.first}"
      end
    else
      # Unknown block name
      error = "Unknown block #{block}"
    end

    # It should be indented after a play_together or repeat block
    if INDENTED_BLOCKS.include?(last_block) && (last_indent + 2) != indent
      error = "'#{block}' appears inproperly indented after a repeat or play_together block"
    end

    if error
      break
    end

    last_block = block
    last_indent = indent
  end

  # Lastly, look for an indented block at the end (empty statement block)
  if INDENTED_BLOCKS.include? last_block
    error ||= "last block is an empty '#{last_block}'"
  end

  # If fix is specified, write out the file again
  if options[:fix]
    File.write(path, result.join)
  end

  error
end
