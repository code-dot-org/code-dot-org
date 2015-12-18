#!/usr/bin/env ruby
require File.expand_path('../../../pegasus/src/env', __FILE__)
require src_dir 'database'
require 'simple-spreadsheet'

CODES_ROOT = 'Codes'

APPLE_DIR = 'Apple'
# country => filename
APPLE_CODES = {
  'Australia' => 'AUS_Q1_16_Promo_PINS_Batch_20_10AUD_250cards_120115073758299.lst',
  'Canada' => 'Canada_Q1_16_Promo_PINS_Batch_20_10CAD_750cards_12011507480051.lst',
  'India' => 'India_Q1_16_Promo_PINS_Batch_20_10INR_250cards_120115100758210.lst',
  'Indonesia' => 'Indonesia_Q1_16_Promo_PINS_Batch_20_10IDR_50cards_120115101757994.lst',
  'Italy' => 'ITALY_Q1_16_Promo_PINS_Batch_20_10EUR_750cards_120115102801117.lst',
  'Mexico' => 'Mexico_Q1_16_Promo_PINS_Batch_20_10MXN_50cards_120115102758146.lst',
  'Spain' => 'SPAIN_Q1_16_Promo_PINS_Batch_20_10EUR_200cards_120115114758840.lst',
  'Turkey' => 'Turkey_Q1_16_Promo_PINS_Batch_20_10TRY_700cards_12021507380014.lst',
  'UK' => 'UK_Q1_16_Promo_PINS_Batch_20_10GBP_750cards_120215090801927.lst',
  'US' => 'US_Q1_16_Promo_PINS_Batch_20_10USD_16250cards_120215091859908.lst'
}

AMAZON_FILE = 'Amazon/Gift Card Codes - Code.org.xlsx'
# sheet name => import details
# Some sheets have a column with the codes,
# while others have multiple values together in a single column separated by semicolons and need to be further parsed
#   i.e. France is in the format "--row-num--;--code--;EUR 10"
AMAZON_CODES = {
  'Amazon Gift Card Codes US' => {country: 'US', col: 2},
  'Amazon Gift Card Codes China' => {country: 'China', col: 2},
  'Amazon Gift Card Codes France' => {country: 'France', col: 1, delimeter: ';', item: 1},
  'Amazon UK Gift Card Codes' => {country: 'UK', col: 2},
  'Amazon Gift Card Codes Canada' => {country: 'Canada', col: 2},
  'Amazon Gift Card Codes Italy' => {country: 'Italy', col: 1, delimeter: ';', item: 1},
  'Amazon Gift Card Codes Spain' => {country: 'Spain', col: 1, delimeter: ';', item: 1},
  'JP Gift Card Codes' => {country: 'Japan', col: 2}
}

MS_DIR = 'Msft'
# country => filename
MS_CODES = {
  'US' => 'msft_us_only.csv'
}

def import_code(type, value)
  DB[:hoc_survey_prizes].insert(type: type, value: value)
end

def import_apple_codes
  APPLE_CODES.each do |country, file_name|
    file_path = File.join(CODES_ROOT, APPLE_DIR, file_name)
    type = "Apple.#{country}"
    puts "Importing #{type} from #{file_path}"
    count = 0
    File.open(file_path).each_line do |line|
      code = line.strip
      next unless code
      import_code type, code
      count+= 1
    end
    puts "  Imported #{count} codes."
  end
end

def import_amazon_codes
  file_path = File.join(CODES_ROOT, AMAZON_FILE)
  spreadsheet = SimpleSpreadsheet::Workbook.read(file_path)
  spreadsheet.sheets.each do |sheet|
    import_info = AMAZON_CODES[sheet]
    raise "Unrecognized sheet name: #{sheet}" unless import_info
    type = "Amazon.#{import_info[:country]}"
    puts "Importing #{type}"
    count = 0
    spreadsheet.selected_sheet = sheet
    # Skip first (header) row
    2.upto(spreadsheet.last_row) do |row|
      data = spreadsheet.cell(row,import_info[:col])
      if import_info[:delimeter]
        data = data.split(import_info[:delimeter])[import_info[:item]]
      end
      import_code type, data
      count += 1
    end
    puts "  Imported #{count} codes."
  end
end

def import_ms_codes
  MS_CODES.each do |country, file_name|
    file_path = File.join(CODES_ROOT, MS_DIR, file_name)
    type = "Microsoft.#{country}"
    puts "Importing #{type} from #{file_path}"
    count = 0
    CSV.foreach(file_path, headers: true) do |row|
      code = row[0].strip
      next unless code
      import_code type, code
      count += 1
    end
    puts "  Imported #{count} codes."
  end
end

import_apple_codes
import_amazon_codes
import_ms_codes
