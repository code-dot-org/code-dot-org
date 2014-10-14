class CSV
  def self.generate_from_dataset(rows)
    # converts something that looks like a Sequel dataset into csv string
    # [{name: 'Bob', number_of_cats: 2}, {name: 'Alice', number_of_cats: 1}]
    #   => "name,number_of_cats\nBob,2\nAlice,1"

    [].tap do |results|
      columns = nil

      rows.each do |row|
        if results.empty?
          columns ||= row.keys
          results << CSV.generate_line(columns)
        end
        results << CSV.generate_line(columns.map{|i| row[i]})
      end
    end.join
  end
end
