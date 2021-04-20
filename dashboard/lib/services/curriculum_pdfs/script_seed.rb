module Services
  module CurriculumPdfs
    # Module which should be prepended to the ScriptSeed Service Object to add
    # automatic PDF generation to the script seeding process.
    module ScriptSeed
      def self.prepended(base)
        class << base
          prepend ClassMethods
        end
      end

      module ClassMethods
        # Wraps ScriptSeed.seed_from_hash with logic to (re-)generate a PDF for
        # the specified script after seeding.
        #
        # We specifically _wrap_ the method rather than simply extending it;
        # this is because we need to examine the state of the data prior to
        # seeding to determine whether or not we're going to want to generate a
        # PDF, but of course the generation itself should happen after seeding.
        #
        # We also are wrapping this specific method rather than one of the
        # more-specific ones like import_script or import_lessons because all
        # of those methods are called within a transaction created by this
        # method, and we want to make sure to generate PDFs _after_ the
        # transaction has been resolved.
        def seed_from_hash(data)
          should_generate_pdfs = CurriculumPdfs.generate_pdfs?(data['script'])
          result = super
          CurriculumPdfs.generate_pdfs(result) if should_generate_pdfs
          result
        end
      end
    end
  end
end
