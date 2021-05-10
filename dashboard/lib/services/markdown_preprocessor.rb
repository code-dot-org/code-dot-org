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
        sub_vocab_definitions! content
        content
      end
    end

    # Returns the key which can be used to create the reference syntax for the
    # given Vocabulary object.
    def self.build_vocab_key(vocab)
      return unless vocab&.course_version&.course_offering.present?
      [vocab.key, vocab.course_version.course_offering.key, vocab.course_version.key].join('/')
    end

    # Returns a copy of `content` with all occurrences of Vocabulary references
    # substituted with the equivalent HTML span.
    #
    # Vocabulary references take the form of:
    # `[v vocab_key/course_offering_key/course_version_key]`
    # For example: `[v loops/coursea/2020]`
    def self.sub_vocab_definitions(content)
      sub_vocab_definitions!(content.dup)
    end

    # Performs the substitutions of MarkdownPreprocessor#sub_vocab_definitions
    # in place
    def self.sub_vocab_definitions!(content)
      vocab_def_re = build_key_re('v', [Vocabulary, CourseOffering, CourseVersion])
      content.gsub!(vocab_def_re) do |match|
        course_version = CourseVersion.joins(:course_offering).
          find_by(key: $3, "course_offerings.key": $2)
        vocab = Vocabulary.find_by(key: $1, course_version: course_version)
        if vocab.present?
          "<span class=\"vocab\" title=#{vocab.definition.inspect}>#{vocab.word}</span>"
        else
          match
        end
      end
    end

    # Returns the key which can be used to create the reference syntax for the
    # given Resource object.
    def self.build_resource_key(resource)
      return unless resource&.course_version&.course_offering.present?
      [resource.key, resource.course_version.course_offering.key, resource.course_version.key].join('/')
    end

    # Returns a copy of `content` with all occurrences of Resource links
    # substituted with the equivalent Markdown links
    #
    # Resource links take the form of:
    # `[r resource_key/course_offering_key/course_version_key]`
    # For example: `[r example-video/csd/2021]`
    def self.sub_resource_links(content)
      sub_resource_links!(content.dup)
    end

    # Performs the substitutions of MarkdownPreprocessor#sub_resource_links in
    # place
    def self.sub_resource_links!(content)
      resource_link_re = build_key_re('r', [Resource, CourseOffering, CourseVersion])
      content.gsub!(resource_link_re) do |match|
        course_version = CourseVersion.joins(:course_offering).
          find_by(key: $3, "course_offerings.key": $2)
        resource = Resource.find_by(key: $1, course_version: course_version)
        if resource.present?
          "[#{resource.name}](#{resource.url})"
        else
          match
        end
      end
    end

    # Simple helper which builds out a regex from the given identifier and
    # models. Requires that the models define a KEY_CHAR_RE which can be used
    # to identify valid `key` values for the model.
    #
    # Specifically, given an identifier "foo" and models Bar and Baz, we will
    # get a regex which matches strings of the form `[foo bar_key/baz_key]`
    def self.build_key_re(identifier, models)
      keys = models.map do |model|
        "(#{model::KEY_CHAR_RE}+)"
      end
      return /\[#{identifier} #{keys.join('/')}\]/
    end
  end
end
