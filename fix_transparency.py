from PIL import Image
import os
import numpy as np

ASSET_DIR = 'public/assets/visuals'

def remove_background(image_path):
    print(f"Processing {image_path}...")
    img = Image.open(image_path).convert("RGBA")
    datas = img.getdata()

    # Check if the image corner is green-ish to decide if we use Chroma Key logic
    corner = img.getpixel((0,0))
    newData = []
    
    # Green check: Green is dominant channel
    is_green_screen = corner[1] > corner[0] and corner[1] > corner[2]
    
    if is_green_screen:
        print(f"Detected Green Screen for {image_path}")
        for item in datas:
            r, g, b = item[:3]
            # Simple Green Screen logic:
            if g > 130 and r < 120 and b < 120:
                newData.append((255, 255, 255, 0)) # Transparent
            elif g > r + b: 
                # Distance to pure green
                dist = ((r - 0)**2 + (g - 255)**2 + (b - 0)**2)**0.5
                if dist < 150: 
                     newData.append((255, 255, 255, 0))
                else:
                     newData.append(item)
            else:
                newData.append(item)
    else:
        # Fallback for non-green images (Attempt to remove simple white/black backgrounds if needed, or leave alone)
        # For now, let's just leave them alone to avoid destroying the 'restored' assets 
        # unless we find a specific solid background.
        print(f"Skipping Green Key for {image_path} (Corner: {corner})")
        newData.extend(datas)

    img.putdata(newData)
    img.save(image_path, "PNG")
    print(f"Saved {image_path}")

# Run on all pngs in dir
for filename in os.listdir(ASSET_DIR):
    if filename.endswith(".png") and "base_model" not in filename: # Don't process the face yet, maybe?
        remove_background(os.path.join(ASSET_DIR, filename))
