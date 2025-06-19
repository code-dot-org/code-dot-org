import matplotlib
import matplotlib.pyplot as plt
import io
import base64

matplotlib.use('AGG')

# Add a plt _repr_png_ function - this will emit a png if plt is returned from a cell
def _repr_png_():
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8') 
    plt.clf()
    plt.close()
    buf.close()
    return image_base64

plt._repr_png_ = _repr_png_

# Override the original show function
def matplotlib_custom_show():
    image_base64 = plt._repr_png_()
    js.imageBase64(image_base64) # type:ignore    

plt.show = matplotlib_custom_show
