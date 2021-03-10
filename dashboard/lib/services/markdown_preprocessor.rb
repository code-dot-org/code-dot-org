require 'digest/md5'

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
    # Returns a copy of `content` with all occurrences of server-only syntax
    # substituted with the equivalent Markdown syntax
    def self.process(content, cache_options: nil)
      process!(content.dup, cache_options: cache_options)
    end

    # Performs the substitutions of MarkdownPreprocessor#process in place.
    #
    # Because the substitutions hit the database, we cache this operation per
    # content string. `cache_options`, if specified, will be passed to the
    # cache fetch call. See
    # https://api.rubyonrails.org/classes/ActiveSupport/Cache/Store.html#method-i-fetch
    # for relevant documentation
    def self.process!(content, cache_options: nil)
      return content unless content.present?
      cache_key = "MarkdownPreprocessor/process/#{Digest::MD5.hexdigest(content)}"
      Rails.cache.fetch(cache_key, cache_options) do
        sub_resource_links! content
        sub_vocab_links! content
        content
      end
    end

    # Returns a copy of `content` with all occurrences of Vocabulary links
    # substituted with the equivalent Markdown links
    def self.sub_vocab_links(content)
      sub_vocab_links!(content.dup)
    end

    # Performs the substitutions of MarkdownPreprocessor#sub_vocab_links in
    # place
    def self.sub_vocab_links!(content)
      # TODO
    end

    # Returns a copy of `content` with all occurrences of Resource links
    # substituted with the equivalent Markdown links
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
