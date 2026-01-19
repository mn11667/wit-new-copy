import json
import sys

try:
    with open('frontend/src/data/db.json', 'r') as f:
        data = json.load(f)
except Exception as e:
    print(f"Error reading file: {e}")
    sys.exit(1)

names = set()

def extract_names(obj):
    if isinstance(obj, dict):
        if 'name' in obj:
            names.add(obj['name'])
        for key, value in obj.items():
            extract_names(value)
    elif isinstance(obj, list):
        for item in obj:
            extract_names(item)

extract_names(data)

print(f"Found {len(names)} unique names.")
for name in sorted(list(names)):
    print(name)
