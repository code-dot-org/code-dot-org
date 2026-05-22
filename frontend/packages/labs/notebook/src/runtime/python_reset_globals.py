# Ported from jupyter-k12 (MIT, Simon Guest). See NOTICE.
# Remove everything except built-ins and transformers/overrides
for name in list(globals().keys()):
    if not name.startswith('_') and name not in ['__builtins__', '__name__', '__doc__', 'ast', 'InputTransformer', 'js', 'io', 'base64']:
        del globals()[name]
