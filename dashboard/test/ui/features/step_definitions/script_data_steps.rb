Then "it is eventually observed that the {string} script data field {string} is {string}" do |dataset, key, value|
  wait_until do
    @browser.execute_script("return JSON.parse(document.querySelector('script[data-#{dataset}]')?.dataset['#{dataset}'] || '{}')['#{key}']").to_s == value
  end
end
