
from PIL import Image
import os

def create_icons():
    # Source image - using logo_new.jpg as it is the "visual" reference
    # and has no transparency issues (it's a JPG).
    source_path = 'public/logo_new.jpg'
    
    if not os.path.exists(source_path):
        print(f"Error: {source_path} not found.")
        return

    try:
        img = Image.open(source_path)
        print(f"Loaded {source_path}: size={img.size}, mode={img.mode}")

        # Ensure correct orientation/mode if needed, though JPG is usually fine.
        if img.mode != 'RGB':
            img = img.convert('RGB')

        # 1. apple-touch-icon.png (180x180)
        # Resize with high quality downsampling (LANCZOS)
        apple_icon = img.resize((180, 180), Image.Resampling.LANCZOS)
        apple_icon.save('public/apple-touch-icon.png', 'PNG')
        print("Created public/apple-touch-icon.png")

        # 2. icon-192.png
        icon_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
        icon_192.save('public/icon-192.png', 'PNG')
        print("Created public/icon-192.png")

        # 3. icon-512.png
        icon_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
        icon_512.save('public/icon-512.png', 'PNG')
        print("Created public/icon-512.png")
        
        # Cleanup any old versions to be safe?
        # subprocess.run(['rm', 'public/apple-touch-icon-*.png'], check=False)

    except Exception as e:
        print(f"Failed to create icons: {e}")

if __name__ == "__main__":
    create_icons()
