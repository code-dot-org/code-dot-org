module DancePartyImageGenerator
  module Metadata
    class Record
      DEFAULT_WIDTH  = 1024
      DEFAULT_HEIGHT = 1024

      def self.from(item, file_name:, prompt_used:, body_color:, secondary_color:, tertiary_color:, width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT)
        {
          "id"              => SecureRandom.uuid,
          "file_name"       => file_name,
          "title"           => title_for(item),
          "description"     => desc_for(item),
          "tags"            => tags_for(item),
          "width"           => width,
          "height"          => height,
          "orientation"     => "portrait",
          "color_palette"   => [],
          "people_count"    => 0,
          "copy_space"      => false,
          "background"      => "transparent",
          "mood"       => item[:adj],
          "animal"          => item[:animal],
          "attire"          => item[:attire],
          "variant"         => item[:variant],
          "prompt_used"     => prompt_used,
          "body_color"      => body_color,
          "secondary_color" => secondary_color,
          "tertiary_color"  => tertiary_color
        }
      end

      # Serialization helpers
      def self.dump(record_hash) = JSON.pretty_generate(record_hash)
      def self.load(json_str)    = JSON.parse(json_str)

      # Formatting helpers
      def self.title_for(i)
        if i[:adj] && i[:attire]
          "#{i[:adj].to_s.titleize} #{i[:animal].to_s.titleize} In #{i[:attire].to_s.titleize}"
        elsif i[:attire]
          "#{i[:animal].to_s.titleize} In #{i[:attire].to_s.titleize}"
        else
          i[:animal].to_s.titleize
        end
      end

      def self.desc_for(i)
        if i[:adj] && i[:attire]
          "#{i[:adj]} #{i[:animal]} in #{i[:attire]}"
        elsif i[:attire]
          "#{i[:animal]} in #{i[:attire]}"
        else
          i[:animal].to_s
        end
      end

      def self.tags_for(i)
        [i[:animal], i[:adj], i[:attire]].compact
      end
    end
  end
end
