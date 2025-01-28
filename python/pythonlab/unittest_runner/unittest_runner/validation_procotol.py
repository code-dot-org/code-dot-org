from neighborhood import World, NeighborhoodContextType

class ValidationProtocol(object):
  def invoke_main(self, file_path = 'main.py'):
    world = World()
    world.set_context_type(NeighborhoodContextType.VALIDATE)
    # Invoke main method. Catch all exceptions so we can reset the context type afterwards.
    try:
      with open(file_path) as main_file:
        exec(main_file.read())
    except FileNotFoundError:
      print('No main file found')
    except Exception as e:
      print('Error executing main file: ', e)

    world.set_context_type(NeighborhoodContextType.RUN)
