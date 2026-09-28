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
    # substituted with the equivalent Markdown syntax.
    #
    # Pass `resolve_vocab: false` when the client renders the `[v key]` syntax
    # itself; it then needs the definitions, which collect_vocab_definitions
    # gathers from the same content.
    #
    # Because the substitutions hit the database, we cache this operation per
    # content string. `cache_options`, if specified, will be passed to the
    # cache fetch call. See
    # https://api.rubyonrails.org/classes/ActiveSupport/Cache/Store.html#method-i-fetch
    # for relevant documentation
    def self.process(content, cache_options: nil, resolve_vocab: true)
      return content if content.blank?
      cache_key = "MarkdownPreprocessor/process/#{Digest::MD5.hexdigest(content)}"
      # The two modes produce different output for the same input, so they
      # cannot share a cache entry.
      cache_key += '/no-vocab' unless resolve_vocab
      Rails.cache.fetch(cache_key, cache_options) do
        result = content.dup
        sub_resource_links! result
        sub_vocab_definitions! result if resolve_vocab
        result
      end
    end

    # Performs the substitutions of MarkdownPreprocessor#process in place.
    #
    # Note that the substitutions themselves happen only on a cache miss, so
    # this assigns the processed content rather than relying on them.
    def self.process!(content, cache_options: nil, resolve_vocab: true)
      return content if content.blank?
      content.replace(process(content, cache_options: cache_options, resolve_vocab: resolve_vocab))
    end

    VOCAB_HTML = proc {|vocab| "<span class=\"vocab\" title=#{vocab.definition.inspect}>#{vocab.word}</span>"}
    # Returns a copy of `content` with all occurrences of Vocabulary references
    # substituted with the equivalent HTML span.
    #
    # Vocabulary references take the form of:
    # `[v vocab_key/course_offering_key/course_version_key]`
    # For example: `[v loops/coursea/2020]`
    def self.sub_vocab_definitions(content, replace_func = VOCAB_HTML)
      sub_vocab_definitions!(content.dup, replace_func)
    end

    # Performs the substitutions of MarkdownPreprocessor#sub_vocab_definitions
    # in place
    def self.sub_vocab_definitions!(content, replace_func = VOCAB_HTML)
      content.gsub!(vocab_def_re) do |match|
        vocab = Services::GloballyUniqueIdentifiers.find_vocab($~[:key])
        if vocab.present?
          replace_func.call(vocab)
        else
          match
        end
      end
    end

    # Returns the word and definition named by each Vocabulary reference in
    # `content`, keyed by the reference itself, for clients which render the
    # `[v key]` syntax rather than receiving it pre-substituted. A reference
    # names a database row the client cannot read, so the resolution has to
    # happen here.
    #
    # `definitions` accumulates across calls, so one page's several fields
    # produce a single map and each key costs at most one query.
    #
    # Unresolvable references are omitted, matching sub_vocab_definitions!,
    # which leaves them in the content as literal text.
    def self.collect_vocab_definitions(content, definitions = {})
      return definitions if content.blank?
      content.scan(vocab_def_re) do
        key = Regexp.last_match[:key]
        next if definitions.key?(key)
        vocab = Services::GloballyUniqueIdentifiers.find_vocab(key)
        definitions[key] = vocab.summarize_for_lesson_show.slice(:word, :definition) if vocab.present?
      end
      definitions
    end

    # Matches a Vocabulary reference, capturing its globally-unique key.
    def self.vocab_def_re
      @@vocab_def_re ||= /\[v (?<key>#{Services::GloballyUniqueIdentifiers.vocab_key_re})\]/
    end

    RESOURCE_LINK_MARKDOWN = proc {|resource| "[#{resource.name}](#{resource.url})"}

    # Returns a copy of `content` with all occurrences of Resource links
    # substituted with the equivalent Markdown links
    #
    # Resource links take the form of:
    # `[r resource_key/course_offering_key/course_version_key]`
    # For example: `[r example-video/csd/2021]`
    def self.sub_resource_links(content, replace_func = RESOURCE_LINK_MARKDOWN)
      sub_resource_links!(content.dup, replace_func)
    end

    # Performs the substitutions of MarkdownPreprocessor#sub_resource_links in
    # place
    def self.sub_resource_links!(content, replace_func = RESOURCE_LINK_MARKDOWN)
      @@resource_link_re ||= /\[r (?<key>#{Services::GloballyUniqueIdentifiers.resource_key_re})\]/
      content.gsub!(@@resource_link_re) do |match|
        resource = Services::GloballyUniqueIdentifiers.find_resource($~[:key])
        if resource.present?
          replace_func.call(resource)
        else
          match
        end
      end
    end
  end
end
