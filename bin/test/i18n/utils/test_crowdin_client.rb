require_relative '../../test_helper'
require_relative '../../../i18n/utils/crowdin_client'

describe I18n::Utils::CrowdinClient do
  let(:described_class) {I18n::Utils::CrowdinClient}
  let(:described_instance) {described_class.new(project: project)}

  let(:project) {'expected_crowdin_project'}
  let(:project_id) {'expected_crowdin_project_id'}
  let(:cdo_crowdin_projects) {{project => {'id' => project_id}}}

  let(:api_token) {'expected_crowdin_api_token'}
  let(:client) {stub(:client)}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  before do
    CDO.stubs(:crowdin_projects).returns(cdo_crowdin_projects)
    I18nScriptUtils.stubs(:crowdin_creds).returns({'api_token' => api_token})
    Crowdin::Client.stubs(:new).returns(client)
  end

  describe '#initialize' do
    it 'defines `client` as Crowdin client instance' do
      client_config = stub(:client_config)

      Crowdin::Client.expects(:new).yields(client_config).returns(client)
      client_config.expects(:api_token=).with(api_token).once
      client_config.expects(:project_id=).with(project_id).once

      assert_equal client, described_instance.send(:client)
    end

    context 'when `project` is not in the CDO.crowdin_projects list' do
      let(:cdo_crowdin_projects) {{'unexpected_crowdin_project' => {'id' => 'unexpected_crowdin_project_id'}}}

      it 'raises "project is invalid" error' do
        actual_error = assert_raises(ArgumentError) {described_instance}
        assert_equal 'project is invalid', actual_error.message
      end
    end
  end

  describe '#add_source_directory' do
    let(:add_source_directory) {described_instance.add_source_directory(crowdin_dir_path)}

    let(:parent_crowdin_dir_path) {'/expected_parent_crowdin_dir_path'}
    let(:parent_crowdin_dir_id) {'expected_parent_crowdin_dir_id'}

    let(:crowdin_dir_name) {'expected_crowdin_dir_name'}
    let(:crowdin_dir_path) {File.join(parent_crowdin_dir_path, crowdin_dir_name)}

    let(:added_crowdin_directory_data) {'added_crowdin_directory_data'}

    before do
      described_instance.stubs(:crowdin_source_name).with(crowdin_dir_path).returns(crowdin_dir_name)

      described_instance.
        stubs(:source_directory).
        with(parent_crowdin_dir_path).
        returns({'id' => parent_crowdin_dir_id})

      described_instance.
        stubs(:request).
        with(:add_directory, directoryId: parent_crowdin_dir_id, name: crowdin_dir_name).
        returns({'data' => added_crowdin_directory_data})
    end

    it 'returns added Crowdin source directory data' do
      assert_equal added_crowdin_directory_data, add_source_directory
    end

    context 'when no parent Crowdin source directory' do
      let(:parent_crowdin_dir_id) {nil}

      before do
        described_instance.expects(:source_directory).with(parent_crowdin_dir_path).returns(nil)
      end

      it 'returns added Crowdin source directory data without parent directoryId' do
        assert_equal added_crowdin_directory_data, add_source_directory
      end
    end

    context 'when `crowdin_dir_name` is empty' do
      let(:crowdin_dir_name) {''}

      it 'returns nil' do
        assert_nil add_source_directory
      end
    end
  end

  describe '#get_source_directory' do
    let(:get_source_directory) {described_instance.get_source_directory(crowdin_dir_path)}

    let(:crowdin_dir_name) {'expected_crowdin_dir_name'}
    let(:crowdin_dir_path) {File.join('/expected_crowdin_dir_path', crowdin_dir_name)}

    let(:crowdin_directory_data) do
      {
        'name' => crowdin_dir_name,
        'path' => crowdin_dir_path,
      }
    end

    let(:namesake_crowdin_dir_path) {File.join('/namesake_crowdin_dir_path', crowdin_dir_name)}
    let(:namesake_crowdin_directory_data) do
      {
        'name' => crowdin_dir_name,
        'path' => namesake_crowdin_dir_path,
      }
    end

    let(:max_items_count) {1}

    around do |test|
      described_class.stub_const(:MAX_ITEMS_COUNT, max_items_count) {test.call}
    end

    before do
      described_instance.stubs(:crowdin_source_name).with(crowdin_dir_path).returns(crowdin_dir_name)
    end

    it 'returns Crowdin source directory data' do
      execution_sequence = sequence('execution')

      described_instance.
        expects(:request).
        with(:list_directories, filter: crowdin_dir_name, offset: 0, limit: max_items_count).
        in_sequence(execution_sequence).
        returns({'data' => ['data' => namesake_crowdin_directory_data]})

      described_instance.
        expects(:request).
        with(:list_directories, filter: crowdin_dir_name, offset: max_items_count, limit: max_items_count).
        in_sequence(execution_sequence).
        returns({'data' => ['data' => crowdin_directory_data]})

      _(get_source_directory).must_equal crowdin_directory_data
    end

    context 'when `crowdin_dir_name` is empty' do
      let(:crowdin_dir_name) {''}

      it 'returns nil' do
        assert_nil get_source_directory
      end
    end
  end

  describe '#get_source_file' do
    let(:get_source_file) {described_instance.get_source_file(crowdin_file_path)}

    let(:crowdin_file_name) {'expected_crowdin_file_name'}
    let(:crowdin_file_path) {File.join('/expected_crowdin_file_path', crowdin_file_name)}
    let(:namesake_crowdin_file_path) {File.join('/namesake_crowdin_file_path', crowdin_file_name)}

    let(:crowdin_file_data) do
      {
        'name' => crowdin_file_name,
        'path' => crowdin_file_path,
      }
    end

    let(:namesake_crowdin_file_data) do
      {
        'name' => crowdin_file_name,
        'path' => namesake_crowdin_file_path,
      }
    end

    let(:max_items_count) {1}

    around do |test|
      described_class.stub_const(:MAX_ITEMS_COUNT, max_items_count) {test.call}
    end

    before do
      described_instance.stubs(:crowdin_source_name).with(crowdin_file_path).returns(crowdin_file_name)
    end

    it 'returns Crowdin source directory data' do
      execution_sequence = sequence('execution')

      described_instance.
        expects(:request).
        with(:list_files, filter: crowdin_file_name, offset: 0, limit: max_items_count).
        in_sequence(execution_sequence).
        returns({'data' => ['data' => namesake_crowdin_file_data]})

      described_instance.
        expects(:request).
        with(:list_files, filter: crowdin_file_name, offset: max_items_count, limit: max_items_count).
        in_sequence(execution_sequence).
        returns({'data' => ['data' => crowdin_file_data]})

      _(get_source_file).must_equal crowdin_file_data
    end
  end

  describe '#add_storage' do
    let(:add_storage) {described_instance.add_storage(file_path)}

    let(:file_path) {'expected_file_path'}

    it 'returns Crowdin storage data of uploaded source file' do
      added_crowdin_storage_data = 'added_crowdin_storage_data'

      described_instance.
        expects(:request).
        with(:add_storage, file_path).
        returns({'data' => added_crowdin_storage_data})

      assert_equal added_crowdin_storage_data, add_storage
    end
  end

  describe '#upload_source_file' do
    let(:upload_source_file) {described_instance.upload_source_file(file_path, crowdin_dir_path)}

    let(:base_path) {'/expected_base_path'}
    let(:crowdin_dir_path) {'/expected_crowdin_dir_path'}
    let(:file_name) {'expected_file_name'}
    let(:crowdin_file_path) {File.join(crowdin_dir_path, file_name)}
    let(:file_path) {File.join(base_path, crowdin_dir_path, file_name)}

    let(:storage_id) {'expected_storage_id'}
    let(:storage_data) {{'id' => storage_id, 'fileName' => file_name}}

    it 'updates existing Crowdin source file' do
      execution_sequence = sequence('execution')
      expected_crowdin_file_id = 'expected_crowdin_file_id'
      updated_crowdin_source_file_data = 'updated_crowdin_source_file_data'

      described_instance.
        expects(:add_storage).
        with(file_path).
        in_sequence(execution_sequence).
        returns(storage_data)

      described_instance.
        expects(:get_source_file).
        with(crowdin_file_path).
        in_sequence(execution_sequence).
        returns({'id' => expected_crowdin_file_id})

      described_instance.
        expects(:request).
        with(:update_or_restore_file, expected_crowdin_file_id, storageId: storage_id).
        in_sequence(execution_sequence).
        returns({'data' => updated_crowdin_source_file_data})

      described_instance.
        expects(:request).
        with(:delete_storage, storage_id).
        in_sequence(execution_sequence)

      assert_equal updated_crowdin_source_file_data, upload_source_file
    end

    it 'adds new Crowdin source file' do
      execution_sequence = sequence('execution')
      expected_directory_id = 'expected_directory_id'
      added_crowdin_source_file_data = 'added_crowdin_source_file_data'

      described_instance.
        expects(:add_storage).
        with(file_path).
        in_sequence(execution_sequence).
        returns(storage_data)

      described_instance.
        expects(:get_source_file).
        with(crowdin_file_path).
        in_sequence(execution_sequence).
        returns(nil)

      described_instance.
        expects(:source_directory).
        with(crowdin_dir_path).
        in_sequence(execution_sequence).
        returns({'id' => expected_directory_id})

      described_instance.
        expects(:request).
        with(:add_file, storageId: storage_id, directoryId: expected_directory_id, name: file_name).
        in_sequence(execution_sequence).
        returns({'data' => added_crowdin_source_file_data})

      described_instance.
        expects(:request).
        with(:delete_storage, storage_id).
        in_sequence(execution_sequence)

      assert_equal added_crowdin_source_file_data, upload_source_file
    end
  end

  describe '#upload_source_files' do
    let(:upload_source_files) {described_instance.upload_source_files(source_files, base_path: base_path)}

    let(:base_path) {'/expected_base_path'}
    let(:crowdin_dir_path) {'/expected_crowdin_dir_path'}
    let(:source_file_path) {File.join(base_path, crowdin_dir_path, 'expected_source_file_path')}
    let(:source_files) {[source_file_path]}

    it 'returns uploaded source file data' do
      expected_source_file_data = 'uploaded_source_file_data'

      described_instance.
        expects(:upload_source_file).
        with(source_file_path, crowdin_dir_path).
        returns(expected_source_file_data)

      source_files_data = upload_source_files do |uploaded_source_file_data|
        _(uploaded_source_file_data).must_equal expected_source_file_data
      end

      _(source_files_data).must_equal [expected_source_file_data]
    end
  end

  describe '#crowdin_source_name' do
    let(:crowdin_source_name) {described_instance.send(:crowdin_source_name, source_path)}

    let(:dirname) {'/dirname/'}
    let(:basename) {'basename'}

    let(:source_path) {File.join(dirname, basename)}

    it 'returns Crowdin source name of `source_path`' do
      assert_equal basename, crowdin_source_name
    end

    context 'when `source_path` contains only file separator' do
      let(:source_path) {'/'}

      it 'returns empty string' do
        assert_equal '', crowdin_source_name
      end
    end
  end

  describe '#source_directory' do
    let(:source_directory) {described_instance.send(:source_directory, crowdin_dir_path)}

    let(:crowdin_dir_path) {'expected_crowdin_dir_path'}

    let(:existing_source_directory) {'existing_source_directory'}
    let(:created_source_directory) {'created_source_directory'}

    before do
      described_instance.stubs(:get_source_directory).with(crowdin_dir_path).returns(existing_source_directory)
      described_instance.stubs(:add_source_directory).with(crowdin_dir_path).returns(created_source_directory)
    end

    it 'returns existing Crowdin source directory data' do
      assert_equal existing_source_directory, source_directory
    end

    it 'stores Crowdin directory data in `@source_directories`' do
      expected_source_directories = {crowdin_dir_path => existing_source_directory}

      source_directory

      assert_equal expected_source_directories, described_instance.instance_variable_get(:@source_directories)
    end

    context 'when Crowdin source directory does not exist' do
      let(:existing_source_directory) {nil}

      it 'returns created Crowdin source directory data' do
        assert_equal created_source_directory, source_directory
      end
    end

    context 'when Crowdin source directory is already creating by another concurrent process' do
      let(:error) {described_class::RequestError.new('directory[parallelCreation]: Already creating directory...')}

      it 'returns existing Crowdin source directory data' do
        execution_sequence = sequence('execution')

        described_instance.
          expects(:get_source_directory).
          with(crowdin_dir_path).
          in_sequence(execution_sequence).
          returns(nil)

        described_instance.
          expects(:add_source_directory).
          with(crowdin_dir_path).
          in_sequence(execution_sequence).
          raises(error)

        described_instance.
          expects(:get_source_directory).
          with(crowdin_dir_path).
          in_sequence(execution_sequence).
          returns(existing_source_directory)

        assert_equal existing_source_directory, source_directory
      end
    end

    context 'when Crowdin source directory is already created by another concurrent process' do
      let(:error) {described_class::RequestError.new('name[notUnique]: Invalid name given. Name must be unique')}

      it 'returns existing Crowdin source directory data' do
        execution_sequence = sequence('execution')

        described_instance.
          expects(:get_source_directory).
          with(crowdin_dir_path).
          in_sequence(execution_sequence).
          returns(nil)

        described_instance.
          expects(:add_source_directory).
          with(crowdin_dir_path).
          in_sequence(execution_sequence).
          raises(error)

        described_instance.
          expects(:get_source_directory).
          with(crowdin_dir_path).
          in_sequence(execution_sequence).
          returns(existing_source_directory)

        assert_equal existing_source_directory, source_directory
      end
    end
  end

  describe '#request' do
    let(:request) {described_instance.send(:request, endpoint, param)}

    let(:endpoint) {'expected_endpoint'}
    let(:param) {'expected_param'}

    let(:crowdin_client_response) {'expected_crowdin_client_response'}

    before do
      client.stubs(endpoint).with(param).returns(crowdin_client_response)
    end

    it 'returns Crowdin client response' do
      assert_equal crowdin_client_response, request
    end

    context 'when Crowdin client response is "Something went wrong..."' do
      let(:crowdin_client_response) {"Something went wrong while request processing. Details - expected details"}

      it 'raises RequestError with additional information' do
        expected_error_message = <<~ERROR_MESSAGE.chomp
          #{crowdin_client_response}
          Project:  #{project}
          Endpoint: #{endpoint}
          Params:   ["#{param}"]
          Attempt:  1
        ERROR_MESSAGE

        actual_error = assert_raises(described_class::RequestError) {request}

        assert_equal expected_error_message, actual_error.message
      end
    end

    context 'when Crowdin client response is "Something went wrong..." with retriable HTTP code in Details' do
      let(:crowdin_client_response) do
        "Something went wrong while request processing. Details - #{expected_retriable_error}"
      end

      let(:expected_retries_count) {2}
      let(:expected_retry_delay) {2}
      let(:expected_retriable_error) {'expected_retriable_error'}

      around do |test|
        described_class.stub_const(:RETRIABLE_ERRORS, [expected_retriable_error]) {test.call}
      end

      it 'returns response from the retried Crowdin client request with 2 second delay' do
        execution_sequence = sequence('execution')
        response_from_retried_request = 'response_from_retried_request'

        described_instance.expects(:sleep).with(expected_retry_delay).in_sequence(execution_sequence).returns(expected_retry_delay)
        client.expects(endpoint).with(param).in_sequence(execution_sequence).returns(response_from_retried_request)

        assert_equal response_from_retried_request, request
      end

      context 'if all requests are retriable' do
        before do
          execution_sequence = sequence('execution')

          expected_retries_count.times do
            described_instance.expects(:sleep).with(expected_retry_delay).in_sequence(execution_sequence).returns(expected_retry_delay)
            client.expects(endpoint).with(param).in_sequence(execution_sequence).returns(crowdin_client_response)
          end
        end

        it 'raises RequestError with additional information after 2 retries with 2 second delay' do
          expected_error_message = <<~ERROR_MESSAGE.chomp
            #{crowdin_client_response}
            Project:  #{project}
            Endpoint: #{endpoint}
            Params:   ["#{param}"]
            Attempt:  #{expected_retries_count + 1}
          ERROR_MESSAGE

          actual_error = assert_raises(described_class::RequestError) {request}

          assert_equal expected_error_message, actual_error.message
        end
      end
    end

    context 'when Crowdin client response is a hash with error' do
      let(:crowdin_client_response) do
        {
          'error' => {
            'code' => error_code,
            'message' => error_message,
          },
        }
      end

      let(:error_code) {'expected_error_code'}
      let(:error_message) {'expected_error_message'}
      let(:expected_error) {"#{error_code} #{error_message}"}

      let(:expected_retries_count) {2}
      let(:expected_retry_delay) {2}
      let(:expected_retriable_error) {expected_error}

      around do |test|
        described_class.stub_const(:RETRIABLE_ERRORS, [expected_retriable_error]) {test.call}
      end

      it 'returns response from the retried Crowdin client request with 2 second delay' do
        execution_sequence = sequence('execution')
        response_from_retried_request = 'response_from_retried_request'

        described_instance.expects(:sleep).with(expected_retry_delay).in_sequence(execution_sequence).returns(expected_retry_delay)
        client.expects(endpoint).with(param).in_sequence(execution_sequence).returns(response_from_retried_request)

        assert_equal response_from_retried_request, request
      end

      context 'if all requests are retriable' do
        before do
          execution_sequence = sequence('execution')

          expected_retries_count.times do
            described_instance.expects(:sleep).with(expected_retry_delay).in_sequence(execution_sequence).returns(expected_retry_delay)
            client.expects(endpoint).with(param).in_sequence(execution_sequence).returns(crowdin_client_response)
          end
        end

        it 'raises RequestError with additional information after 2 retries with 2 second delay' do
          expected_error_message = <<~ERROR_MESSAGE.chomp
            #{expected_error}
            Project:  #{project}
            Endpoint: #{endpoint}
            Params:   ["#{param}"]
            Attempt:  #{expected_retries_count + 1}
          ERROR_MESSAGE

          actual_error = assert_raises(described_class::RequestError) {request}

          assert_equal expected_error_message, actual_error.message
        end
      end
    end

    context 'when Crowdin client response is a hash with errors' do
      let(:crowdin_client_response) do
        {
          'errors' => [
            {
              'error' => {
                'key' => error_key,
                'errors' => [
                  {
                    'code' => error_code_1,
                    'message' => error_message_1,
                  }, {
                    'code' => error_code_2,
                    'message' => error_message_2,
                  },
                ],
              },
            },
          ],
        }
      end

      let(:error_key) {'expected_error_key'}
      let(:error_code_1) {'expected_error_code_1'}
      let(:error_message_1) {'expected_error_message_1'}
      let(:error_code_2) {'expected_error_code_2'}
      let(:error_message_2) {'expected_error_message_2'}

      it 'raises RequestError with stringified errors and additional information' do
        expected_error_message = <<~ERROR_MESSAGE.chomp
          #{error_key}[#{error_code_1}]: #{error_message_1}
          #{error_key}[#{error_code_2}]: #{error_message_2}
          Project:  #{project}
          Endpoint: #{endpoint}
          Params:   ["#{param}"]
          Attempt:  1
        ERROR_MESSAGE

        actual_error = assert_raises(described_class::RequestError) {request}

        assert_equal expected_error_message, actual_error.message
      end
    end
  end
end
