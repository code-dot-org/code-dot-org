require_relative '../test_helper'
require_relative '../../animation_assets/manifest_builder'

describe ManifestBuilder do
  let(:aws_credentials) {Aws::Credentials.new('test_aws_key', 'test_aws_secret')}

  before do
    STDOUT.stubs(:print)
    Aws::CredentialProviderChain.any_instance.stubs(:static_credentials).returns(aws_credentials)
  end

  describe '#get_animation_strings' do
    context 'for spritelab quietly' do
      let(:manifest_builder) {ManifestBuilder.new({spritelab: true, quite: true})}

      it 'returns spritelab animation strings' do
        animation_strings = nil

        VCR.use_cassette('animations/manifest_spritelab_strings', record: :none) do
          animation_strings = manifest_builder.get_animation_strings
        end

        assert_equal({'test_alias_1' => 'test_alias_1', 'test_alias_2' => 'test_alias_2'}, animation_strings)
      end
    end
  end

  describe '#upload_localized_manifest' do
    context 'for spritelab quitly' do
      let(:manifest_builder) {ManifestBuilder.new({spritelab: true, upload_to_s3: true, quite: true})}

      it 'uploads spritelab animations manifest to the S3 bucket' do
        expected_uploads = 2
        expected_manifest_data = <<-JSON.strip.gsub(/^ {10}/, '')
          {
            "//": [
              "Animation Library Manifest",
              "GENERATED FILE: DO NOT MODIFY DIRECTLY",
              "See tools/scripts/rebuildAnimationLibraryManifest.rb for more information."
            ],
            "metadata": {
              "category_test_1/valid_test": {
                "name": "valid_test",
                "categories": [
                  "test_category"
                ],
                "frameCount": 1,
                "frameSize": {
                  "x": 100,
                  "y": 200
                },
                "looping": true,
                "frameDelay": 2,
                "jsonLastModified": "2021-01-19 23:48:52 UTC",
                "pngLastModified": "2021-01-19 23:48:53 UTC",
                "version": "QtaHBb9VSb33E0CMEgEECueLtkomMS9t",
                "sourceUrl": "/api/v1/animation-library/spritelab/QtaHBb9VSb33E0CMEgEECueLtkomMS9t/category_test_1/valid_test.png",
                "sourceSize": {
                  "x": 400,
                  "y": 400
                }
              }
            },
            "categories": {
              "test_category": [
                "category_test_1/valid_test"
              ]
            },
            "aliases": {
              "expected_test_alias_1_translation": [
                "category_test_1/valid_test"
              ],
              "valid_test": [
                "category_test_1/valid_test"
              ]
            }
          }
        JSON

        AWS::S3.expects(:upload_to_bucket).with(
          'cdo-animation-library',
          'animation-manifests/manifests/spritelabCostumeLibrary.en_us.json',
          expected_manifest_data,
          acl: 'public-read',
          no_random: true,
          content_type: 'json',
        ).times(expected_uploads)

        VCR.use_cassette('animations/manifest_spritelab_strings', record: :none) do
          expected_uploads.times do
            manifest_builder.upload_localized_manifest('en_us', {'test_alias_1' => 'expected_test_alias_1_translation'})
          end
        end
      end
    end
  end
end
