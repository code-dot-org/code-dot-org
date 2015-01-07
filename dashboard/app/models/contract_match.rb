# Contract Match type.
class ContractMatch < DSLDefined
  def dsl_default
    <<ruby
name 'Enter name here'
title 'Enter title here'
content1 'Enter prompt here'
answer 'Contract Name|Number|Domain1:Number|Domain2:string'
ruby
  end
end
