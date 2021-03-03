module Services
  # A module for "preprocessing" Markdown strings.
  #
  # Specifically, there are situations in which we'd like to be able to
  # reference database content in Markdown syntax. Because our Markdown is
  # often rendered clientside, we obviously can't implement this syntax
  # directly in the Markdown renderer. So as a compromise, what we do is we
  # preprocess the Markdown here on the server to replace those syntaxes with
  # plain Markdown syntaxes which we can then hand off to the client for
  # rendering.
  #
  # As of March 2021, this is used exclusively by Lesson Plans to emulate
  # existing Markdown syntaxes which we inherited from CurriculumBuilder.
  module MarkdownPreprocessor
    # Returns a copy of `content` with _all_ occurrences of Resource links
    # substituted for the equivalent Markdown links
    def self.sub_resource_links(content)
      sub_resource_links!(content.dup)
    end

    # Performs the substitutions of MarkdownPreprocessor#sub_resource_links in
    # place
    def self.sub_resource_links!(content)
      content.gsub!(/\[r (#{Resource::KEY_CHAR_RE}+)\]/) do |match|
        # apparently "$1" is how ruby expects us to get match data in a block
        resource = Resource.find_by(key: $1)
        if resource.present?
          "[#{resource.name}](#{resource.url})"
        else
          match
        end
      end
    end
  end
end
