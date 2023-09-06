require_relative '../../test_helper'
require_relative '../../../cdo/google/drive'

describe Google::Drive do
  let(:google_drive) {Google::Drive.new(service_account_key: service_account_key)}

  let(:service_account_key) {'expected_service_account_key'}
  let(:google_drive_session) {stub}

  before do
    StringIO.stubs(:new).with(JSON.dump(service_account_key)).returns('expected_service_account_key_json_io')
    GoogleDrive::Session.stubs(:from_service_account_key).with('expected_service_account_key_json_io').returns(google_drive_session)
  end

  describe '#update_worksheet' do
    let(:update_worksheet) {google_drive.update_worksheet(spreadsheet_name, worksheet_name, rows)}

    let(:spreadsheet_name) {'expected_spreadsheet_name'}
    let(:worksheet_name) {'expected_worksheet_name'}
    let(:rows) {[%w[expected_header], %w[expected_row1], %w[expected_row2], %w[expected_row3]]}

    let(:spreadsheet) {stub}
    let(:worksheet) {stub}

    before do
      google_drive_session.expects(:spreadsheet_by_title).with(spreadsheet_name).once.returns(spreadsheet)
      spreadsheet.expects(:worksheet_by_title).with(worksheet_name).once.returns(worksheet) if spreadsheet
    end

    it 'updates the worksheet with new rows' do
      execution_sequence = sequence('execution')

      Google::Drive.stub_const(:BATCH_UPDATE_SIZE, 1) do
        existing_worksheet_rows = [%w[expected_header], %w[expected_row1]]

        worksheet.expects(:rows).in_sequence(execution_sequence).returns(existing_worksheet_rows)

        worksheet.expects(:update_cells).with(3, 1, [%w[expected_row2]]).in_sequence(execution_sequence)
        worksheet.expects(:save).in_sequence(execution_sequence)

        worksheet.expects(:update_cells).with(4, 1, [%w[expected_row3]]).in_sequence(execution_sequence)
        worksheet.expects(:save).in_sequence(execution_sequence)

        update_worksheet
      end
    end

    context 'when the spreadsheet does not exist' do
      let(:spreadsheet) {nil}

      it 'creates the spreadsheet with the worksheet' do
        google_drive.expects(:add_sheet_to_spreadsheet).with(rows, spreadsheet_name, worksheet_name).once
        update_worksheet
      end
    end

    context 'when the worksheet does not exists' do
      let(:worksheet) {nil}

      it 'adds the worksheet to the spreadsheet' do
        google_drive.expects(:add_sheet_to_spreadsheet).with(rows, spreadsheet_name, worksheet_name).once
        update_worksheet
      end
    end
  end
end
