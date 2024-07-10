class ArithmoProcessor
  def self.format_inputs
    # Format input for Arithmo model as detailed at https://huggingface.co/akjindal53244/Arithmo-Mistral-7B.
    # Note the Question-Answer format - prior user and assistant messages are NOT included.
    inputs = "Question: " + instructions + " " + new_message[:chatMessageText]
    inputs << (NEWLINE + "Answer:")
    inputs
  end

  def self.format_outputs
  end
  
  def self.get_stop_strings
  end
end