import os
from PIL import Image

def compress_images(directory, max_width=2000, quality=75):
    supported_extensions = ('.jpg', '.jpeg', '.png')
    
    for filename in os.listdir(directory):
        if filename.lower().endswith(supported_extensions):
            file_path = os.path.join(directory, filename)
            try:
                with Image.open(file_path) as img:
                    # 获取原始大小
                    original_size = os.path.getsize(file_path)
                    width, height = img.size
                    
                    # 只有当宽度超过最大限制时才缩放
                    if width > max_width:
                        new_height = int((max_width / width) * height)
                        img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
                        print(f"Resizing {filename} from {width}x{height} to {max_width}x{new_height}")

                    # 对于 PNG 转换为 RGB 以进行 JPEG 压缩
                    if img.mode in ("RGBA", "P"):
                        img = img.convert("RGB")
                    
                    # 保存图片，如果是 PNG 改为 jpg 保存以减小体积
                    # 但为了不破坏 MD 链接，我们保持原扩展名，但内部按需优化
                    img.save(file_path, optimize=True, quality=quality)
                    
                    new_size = os.path.getsize(file_path)
                    reduction = (original_size - new_size) / (1024 * 1024)
                    print(f"Compressed {filename}: {original_size/1024/1024:.2f}MB -> {new_size/1024/1024:.2f}MB (Saved {reduction:.2f}MB)")
            except Exception as e:
                print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    target_dir = r"d:\Blog\source\images"
    print(f"Starting compression in {target_dir}...")
    compress_images(target_dir)
    print("All tasks completed.")
