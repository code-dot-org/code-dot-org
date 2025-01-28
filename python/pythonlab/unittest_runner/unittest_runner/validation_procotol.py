from neighborhood import World, NeighborhoodContextType

class ValidationProtocol(object):
  def invoke_main_method(self):
    world = World()
    world.set_context_type(NeighborhoodContextType.VALIDATE)
    # invoke main method
    with open('main.py') as main_file:
      exec(main_file.read())
    world.set_context_type(NeighborhoodContextType.RUN)