#!/usr/bin/env ruby
#
# This script automates the download of data on AP participation by state from the College Board's website.
# It was originally written to download data for the period 2007-2016,
# and has been modified to allow someone to download data for a single year (in this case, 2017)
# and for multiple tests (in this case, CSP and CSA, since this is the first year that the two were offered).
#
require 'csv'
require 'net/http'
require 'open-uri'
require 'rubyXL'
require 'spreadsheet'

ARCHIVED_BASE_URL =
  'http://media.collegeboard.com/digitalServices/pdf/research'.freeze
CURRENT_BASE_URL =
  'https://secure-media.collegeboard.org/digitalServices/misc/ap/'.freeze
OUTPUT_FILE = '/tmp/college_board_data.csv'.freeze

STATES_WITH_DC = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'DC',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
].freeze

# An array of hashes, with each hash specifying the years to which it applies
# and the cells to grab (as a hash from tab names to an array of cells).
# Allows extraction of multiple tests (relevant as of 2017)
SPECS = [
  {
    years: [2007, 2008, 2009],
    tests: {
      csa: {
        all: %w(J18 J32 J39 J53 J60 J74),
        females: %w(J74)
      },
      csab: {
        all: %w(K18 K32 K39 K53 K60 K74),
        females: %w(K74)
      }
    }
  },
  {
    years: [2010, 2011],
    tests: {
      csa: {
        all: %w(J18 J32 J39 J53 J60 J74),
        females: %w(J74)
      }
    }
  },
  {
    years: [2012],
    tests: {
      csa: {
        all: %w(K19 K33 K40 K54 K61 K75),
        females: %w(K75)
      }
    }
  },
  {
    years: [2013, 2014, 2015],
    tests: {
      csa: {
        All: %w(K19 K33 K40 K54 K61 K75),
        Females: %w(K75)
      }
    }
  },
  {
    years: [2016],
    tests: {
      csa: {
        All: %w(K12 K26 K33 K40 K75),
        Females: %w(K75)
      }
    }
  },
  {
    years: [2017],
    tests: {
      csa: {
        All: %w(K12 K26 K33 K40 K75),
        Females: %w(K75)
      },
      csp: {
        All: %w(L12 L26 L33 L40 L75),
        Females: %w(L75)
      }
    }
  }
].freeze

# Generates the URL from which the AP College Board serves the data for the
# specified year and state.
# @param year [Integer] The desired year.
# @param state [String] The desired state.
# @return [String] The URL with the data for the given year and state.
def get_url(year, state)
  if year == 2007
    state.tr!(' ', '-')
    state.upcase!
    state = 'DISTRICT_OF_COLUMBIA' if state == 'DC'
    return "#{ARCHIVED_BASE_URL}/#{year}/#{state}_Summary.xls"
  end

  if year == 2008
    state.tr!(' ', '-')
    state.upcase!
    state = 'DISTRICT_OF_COLUMBIA' if state == 'DC'
    if state == 'OREGON'
      return "#{ARCHIVED_BASE_URL}/#{year}/#{state}_Summar_#{year.to_s[2..3]}y.xls"
    end
    return "#{ARCHIVED_BASE_URL}/#{year}/#{state}_Summary_#{year.to_s[2..3]}.xls"
  end

  if year == 2009 || year == 2010
    state.tr!(' ', '_')
    state.upcase!
    return "#{ARCHIVED_BASE_URL}/#{year}/#{state}_Summary_#{year.to_s[2..3]}.xls"
  end

  if year == 2011
    state.tr!(' ', '_')
    state.upcase!
    state = 'DISTRICT_OF_COLUMBIA' if state == 'DC'
    return "#{ARCHIVED_BASE_URL}/#{year}/#{state}_Summary_#{year.to_s[2..3]}.xls"
  end

  if year == 2012
    state.upcase! if state == 'Alaska'
    state.tr!(' ', '_')
    if state == 'Arizona'
      return "#{ARCHIVED_BASE_URL}/#{year}/#{state}_Summery_#{year.to_s[2..3]}.xls"
    end
    return "#{ARCHIVED_BASE_URL}/#{year}/#{state}_Summary_#{year.to_s[2..3]}.xls"
  end

  if year == 2013
    state.tr!(' ', '_')
    return "#{ARCHIVED_BASE_URL}/#{year}/#{state}_Summary_#{year.to_s[2..3]}.xls"
  end

  if year == 2014
    state.tr!(' ', '_')
    return "#{ARCHIVED_BASE_URL}/#{year}/#{state}_Summary.xlsx"
  end

  if year == 2015
    state = 'District of Columbia' if state == 'DC'
    state.tr!(' ', '-')
    state.downcase!
    return "http://media.collegeboard.com/digitalServices/misc/ap/#{state}-summary-#{year}.xlsx"
  end

  if year == 2016 || year == 2017
    state = 'District of Columbia' if state == 'DC'
    state.tr!(' ', '-')
    state.downcase!
    return "https://secure-media.collegeboard.org/digitalServices/misc/ap/#{state}-summary-#{year}.xlsx"
  end
end

# Generates the local filename for the data for the specified year and state.
# @param year [Integer] The specified year.
# @param state [String] The specified state.
# @return [String] The location of the local file.
def get_filename(year, state)
  extension = "xls"
  extension = "xlsx" if year >= 2014
  "/tmp/#{state.tr(' ', '_')}_#{year}.#{extension}"
end

# Converts the column from a ('A'-based) string to an integer.
# @param column [String] The column as a string, i.e., "A" or "C" or "AC".
# @return [Integer] The (zero-based) index of the column, i.e., 0 or 2 or 28.
def convert_column_to_integer(column)
  column_as_integer = 0
  column.chars.reverse.each_with_index do |char, index|
    column_as_integer += (char.ord - 'A'.ord + 1) * 26**index
  end
  column_as_integer - 1
end

# Extracts the (integer) row from a column_row string.
# @param column_row [String] The column_row, e.g., 'J18' or 'K19' or 'AC13'.
# @return [Integer] The row as an integer, e.g., 18 or 19 or 13.
def get_row_from_column_row(column_row)
  one_based_row = column_row.
    chars.
    reject {|c| c.ord >= 'A'.ord && c.ord <= 'Z'.ord}.
    join('').
    to_i
  one_based_row - 1
end

# Extracts the (integer) column from a column_row string.
# @param column_row [String] The column_row, e.g., 'J18' or 'K19' or 'AC13'.
# @return [Integer] The column as an (zero-based) integer, e.g., 9 or 10 or 28.
def get_column_from_column_row(column_row)
  column_as_string = column_row.
    chars.
    reject {|c| c.ord >= '0'.ord && c.ord <= '9'.ord}.
    join('')
  convert_column_to_integer(column_as_string)
end

# Extracts the tab_name for the purported tab name.
# @param year [Integer] The year.
# @param state [String] The state.
# @param tab [Symbol] The purported tab name, as a symbol.
# @return [String] The actual tab name, as a string.
def get_tab_name(year, state, tab)
  if year == 2013 && state == 'Virginia' && tab == 'All'
    return 'All '
  end
  if year == 2014 && state == 'Montana' && tab == 'Females'
    return ' Females'
  end
  if year == 2016 && state == 'Alabama' && tab == 'All'
    return 'ALL'
  end
  tab.to_s
end

# Retrieves the value in the spreadsheet with the indicated year and state_name
# in the cell with the indicated tab and column_row.
# @return [String] The specified cell value.
def get_value(spreadsheet, year, state, tab, column_row)
  value = ''
  fixed_tab = get_tab_name(year, state, tab.to_s)
  begin
    if year >= 2014
      t = spreadsheet[fixed_tab]
      row = t[get_row_from_column_row(column_row)]
      value = row[get_column_from_column_row(column_row)].value
    else
      t = spreadsheet.worksheet fixed_tab
      row = t.row(get_row_from_column_row(column_row))
      value = row[get_column_from_column_row(column_row)]
    end
  rescue Exception
    puts "  YEAR: #{year}. STATE_NAME: #{state}. FIXED_TAB: #{fixed_tab}. "\
      "COLUMN_ROW: #{column_row}."
    raise
  end

  return value
end

# Downloads the XLS files from the AP College Board.
# @param [Integer] specific_year The specific year, if any, to download. If nil, all years are downloaded.
#   Default is nil.
def get_xlss(specific_year=nil)
  STATES_WITH_DC.each do |state|
    puts "  DOWNLOADING #{state}..."
    SPECS.each do |spec|
      year_collection = specific_year.nil? ? spec[:years] : [specific_year]
      year_collection.each do |year|
        File.write(
          get_filename(year, state.clone),
          Net::HTTP.get(URI.parse(get_url(year, state.clone)))
        )
      end
    end
  end
end

# Processes the XLS files stored locally.
# @param [Integer] specific_year The specific year, if any, to download. If nil, all years are downloaded.
#   Default is nil.
# @return [Array] An array of arrays, each subarray containing information about
#   about one value extracted from some XLS file.
def process_xlss(specific_year=nil)
  data = []
  STATES_WITH_DC.each do |state|
    puts "PROCESSING #{state}..."
    SPECS.each do |spec|
      # Years to iterate over either determined by spec, or just a single year
      year_collection = specific_year.nil? ? spec[:years] : [specific_year]
      year_collection.each do |year|
        spreadsheet =
          if year >= 2014
            RubyXL::Parser.parse get_filename(year, state)
          else
            Spreadsheet.open get_filename(year, state)
          end
        spec[:years].each do |spec_year|
          next unless spec_year == year
          spec[:tests].each do |test_name, cells_of_interest|
            cells_of_interest.each do |tab, column_rows|
              column_rows.each do |column_row|
                data << [
                  state,
                  year,
                  test_name,
                  tab,
                  column_row,
                  get_value(spreadsheet, year, state, tab, column_row)
                ]
              end
            end
          end
        end
      end
    end
  end
  data
end

# Writes the data to a CSV.
# @param data [Array] An array of arrays.
def output_csv(data)
  CSV.open(OUTPUT_FILE, 'wb') do |csv|
    data.each do |datum|
      csv << datum
    end
  end
end

def main
  print 'INTERESTED IN A YEAR OR ALL DATA (4 DIGIT NUMBER OR ALL): '
  period = gets.chomp

  print 'SHOULD I DOWNLOAD FILES? (Y/N): '
  download = gets.chomp
  if download == 'Y'
    if period == 'ALL'
      get_xlss
    elsif (2007..2017).cover? period.to_i
      get_xlss(period.to_i)
    else
      puts 'NOTHING DOWNLOADED'
    end
  end

  print 'SHOULD I PROCESS ALL FILES? (Y/N): '
  process = gets.chomp
  if process == 'Y'
    data = process_xlss(period.to_i)
  else
    puts 'NOTHING PROCESSED'
  end

  print 'SHOULD I OUTPUT ALL DATA? (Y/N): '
  output = gets.chomp
  if output == 'Y'
    output_csv(data)
  else
    puts 'NOTHING OUTPUTTED'
  end
end

main
