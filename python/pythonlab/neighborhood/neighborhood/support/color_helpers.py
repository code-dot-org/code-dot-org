import re

HEX_WEB_COLOR_PATTERN = r"^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$"
WEB_COLORS = {
    "white", "silver", "gray", "black", "red", "maroon", "yellow", "olive", 
    "lime", "green", "aqua", "teal", "blue", "navy", "fuchsia", "purple", 
    "mediumvioletred", "deeppink", "palevioletred", "hotpink", "lightpink", 
    "pink", "darkred", "firebrick", "crimson", "indianred", "lightcoral", 
    "salmon", "darksalmon", "lightsalmon", "orangered", "tomato", "darkorange", 
    "coral", "orange", "darkkhaki", "gold", "khaki", "peachpuff", "palegoldenrod", 
    "moccasin", "papayawhip", "lightgoldenrodyellow", "lemonchiffon", 
    "lightyellow", "brown", "saddlebrown", "sienna", "chocolate", "darkgoldenrod", 
    "peru", "rosybrown", "goldenrod", "sandybrown", "tan", "burlywood", "wheat", 
    "navajowhite", "bisque", "blanchedalmond", "cornsilk", "darkgreen", 
    "darkolivegreen", "forestgreen", "seagreen", "olivedrab", "mediumseagreen", 
    "limegreen", "springgreen", "mediumspringgreen", "darkseagreen", 
    "mediumaquamarine", "yellowgreen", "lawngreen", "chartreuse", "lightgreen", 
    "greenyellow", "palegreen", "darkcyan", "lightseagreen", "cadetblue", 
    "darkturquoise", "mediumturquoise", "turquoise", "cyan", "aquamarine", 
    "paleturquoise", "lightcyan", "darkblue", "mediumblue", "midnightblue", 
    "royalblue", "steelblue", "dodgerblue", "deepskyblue", "cornflowerblue", 
    "skyblue", "lightskyblue", "lightsteelblue", "lightblue", "powderblue", 
    "indigo", "darkmagenta", "darkviolet", "darkslateblue", "blueviolet", 
    "darkorchid", "magenta", "slateblue", "mediumslateblue", "mediumorchid", 
    "mediumpurple", "orchid", "violet", "plum", "thistle", "lavender", 
    "mistyrose", "antiquewhite", "linen", "beige", "whitesmoke", "lavenderblush", 
    "oldlace", "aliceblue", "seashell", "ghostwhite", "honeydew", "floralwhite", 
    "azure", "mintcream", "snow", "ivory", "darkslategray", "dimgray", "slategray", 
    "lightslategray", "darkgray", "lightgray", "gainsboro"
}

def is_color(color: str) -> bool:
    # Check if the color matches the hex pattern or is in the set of web colors
    return bool(re.match(HEX_WEB_COLOR_PATTERN, color)) or color.lower() in WEB_COLORS

def to_color_string(*color) -> str | None:
    """
    Normalizes a color argument into a string the front end can draw, or returns
    None if it is not a color.

    Accepts either one CSS color name or hex string, which comes back unchanged,
    or three red/green/blue components between 0 and 255, which become "#rrggbb".
    """
    if len(color) == 1 and isinstance(color[0], str):
        return color[0] if is_color(color[0]) else None
    if len(color) == 3 and all(_is_rgb_component(component) for component in color):
        return "#%02x%02x%02x" % color
    return None

def _is_rgb_component(value) -> bool:
    # bool is a subclass of int, but True is not a red value.
    return isinstance(value, int) and not isinstance(value, bool) and 0 <= value <= 255
