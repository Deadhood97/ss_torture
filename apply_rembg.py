import os
from rembg import remove
from PIL import Image

input_dir = 'public/assets/visuals'
output_dir = 'public/assets/visuals/processed'
os.makedirs(output_dir, exist_ok=True)

# List of files to process
for filename in os.listdir(input_dir):
    if filename.endswith('.png'):
        inp_path = os.path.join(input_dir, filename)
        out_path = os.path.join(output_dir, filename)
        
        print(f"Processing {filename}...")
        try:
            with open(inp_path, 'rb') as i:
                with open(out_path, 'wb') as o:
                    input_data = i.read()
                    output_data = remove(input_data)
                    o.write(output_data)
            print(f"Saved {filename}")
        except Exception as e:
            print(f"Error processing {filename}: {e}")
