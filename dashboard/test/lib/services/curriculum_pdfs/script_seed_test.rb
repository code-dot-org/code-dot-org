require 'test_helper'
require 'pdf/conversion'

class Services::CurriculumPdfs::ScriptSeedTest < ActiveSupport::TestCase
  setup do
    PDF.stubs(:invoke_generation_script)
  end

  test 'wraps ScriptSeed with PDF generation logic' do
    CDO.stubs(:rack_env).returns(:staging)
    script = create(:script, is_migrated: true)
    seed_hash = JSON.parse(Services::ScriptSeed.serialize_seeding_json(script))

    # Generate PDFs on first seed
    Services::CurriculumPdfs.expects(:generate_pdfs).once
    Services::ScriptSeed.seed_from_hash(seed_hash)

    # Don't regenerate on a non-update seed
    Services::CurriculumPdfs.expects(:generate_pdfs).never
    Services::ScriptSeed.seed_from_hash(seed_hash)

    # Do regenerate on an update seed
    seed_hash['script']['serialized_at'] =
      Time.parse(seed_hash['script']['serialized_at']) + 1.hour
    Services::CurriculumPdfs.expects(:generate_pdfs).once
    Services::ScriptSeed.seed_from_hash(seed_hash)
  end
end
