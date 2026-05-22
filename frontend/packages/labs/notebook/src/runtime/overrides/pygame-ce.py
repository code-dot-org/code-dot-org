# Ported from jupyter-k12 (MIT, Simon Guest). See NOTICE.
import pygame
import io, base64
from PIL import Image


# Custom Display Class
class CustomDisplay:
    def __init__(self):
        self.surface = None

    def set_mode(self, size, flags=0, depth=0):
        self.surface = pygame.Surface(size)  # Create an off-screen surface
        return self.surface

    def update(self):
        # Partial updates are currently unsupported
        return self.flip()

    def flip(self):
        # Updates the screen surface and returns to JS as a base64 string
        data_bytes = pygame.image.tobytes(self.surface, 'RGB')
        image = Image.frombytes('RGB', self.surface.get_size(), data_bytes)
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        js.imageBase64(image_base64) # type:ignore

    def set_caption(self, title):
        # No-op on set_caption, we don't need it for the notebook
        pass

# Custom Event Class
class CustomEvent:
    def get(self):
        # Return empty list since we don't need events in the notebook
        return []

# Custom init function
def _custom_init():
    # No-op on init, we don't need it for the notebook
    pygame.display = CustomDisplay()
    pygame.event = CustomEvent()

def custom_quit():
    # No-op on quit, we don't need it for the notebook
    pass

# Replace pygame.init, quit, display and event
pygame.init = _custom_init
pygame.quit = custom_quit
