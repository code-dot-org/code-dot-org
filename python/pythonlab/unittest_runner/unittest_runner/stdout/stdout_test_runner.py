from unittest_runner.validation_protocol import ValidationProtocol

def run_and_get_stdout(main_file_path = None) -> list[str]:
  validation_protocol = ValidationProtocol()
  validation_protocol.invoke_main(main_file_path)
  lines = validation_protocol.get_stdout_lines()
  validation_protocol.clean_up()
  return lines
