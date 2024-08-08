import json

def read_json(filename):
    with open(filename, 'r') as f:
        return json.load(f)
    
def write_json(filename, data):
    print(f"write_json(filename={filename}, data={data})")
    with open(filename, 'w') as f:
        f.write(json.dumps(data))
        f.flush()
