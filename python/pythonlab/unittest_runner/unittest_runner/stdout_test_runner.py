from .validation_protocol import ValidationProtocol

def run_and_get_stdout() -> list[str]:
  validation_protocol = ValidationProtocol()
  validation_protocol.invoke_main()
  lines = validation_protocol.get_stdout_lines()
  validation_protocol.clean_up()
  return lines
  