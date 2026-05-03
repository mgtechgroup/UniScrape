"""pyvips integration for UniScrape - high-performance image processing"""
import os
import hashlib
from pathlib import Path
import pyvips

# Turn off libvips warnings in production
pyvips.cache_set_max(1000)
pyvips.cache_set_max_mem(256 * 1024 * 1024)  # 256MB cache
pyvips.cache_set_max_files(100)

CACHE_DIR = Path(os.environ.get("VIPSCACHE_DIR", "cache/vips"))
CACHE_DIR.mkdir(parents=True, exist_ok=True)


def is_available():
    """Check if pyvips is loaded"""
    return True


def version():
    """Get libvips version"""
    return pyvips.version(0), pyvips.version(1)


def thumbnail(source_path, width=300, height=300, crop="attention"):
    """Generate thumbnail via libvips (4-10x faster than PIL)"""
    cache_key = hashlib.md5(f"{source_path}{width}{height}{crop}".encode()).hexdigest()
    dest = CACHE_DIR / f"thumb_{cache_key}.jpg"
    
    if dest.exists():
        return str(dest)
    
    try:
        image = pyvips.Image.thumbnail(str(source_path), width, height=height, crop=crop)
        image.jpegsave(str(dest), Q=85, strip=True)
        return str(dest)
    except Exception as e:
        return f"error: {e}"


def optimize(source_path, max_width=2048, quality=80):
    """Optimize image for web delivery, convert to WebP"""
    cache_key = hashlib.md5(f"{source_path}{max_width}{quality}".encode()).hexdigest()
    dest = CACHE_DIR / f"opt_{cache_key}.webp"
    
    if dest.exists():
        return str(dest)
    
    try:
        image = pyvips.Image.new_from_file(str(source_path), access="sequential")
        image = image.autorot()
        
        if image.width > max_width:
            scale = max_width / image.width
            image = image.resize(scale)
        
        image = image.copy(interpretation="srgb")
        image.webpsave(str(dest), Q=quality, strip=True)
        return str(dest)
    except Exception as e:
        return f"error: {e}"


def metadata(source_path):
    """Extract image metadata"""
    try:
        image = pyvips.Image.new_from_file(str(source_path), access="sequential")
        return {
            "width": image.width,
            "height": image.height,
            "bands": image.bands,
            "format": image.get("vips-loader"),
            "interpretation": str(image.interpretation),
            "has_alpha": image.has_alpha(),
            "format_supported": True,
        }
    except Exception as e:
        return {"error": str(e), "format_supported": False}


def responsive(source_path, sizes=(320, 640, 1024, 2048)):
    """Generate multiple responsive sizes"""
    results = {}
    for size in sizes:
        results[str(size)] = thumbnail(source_path, size, 0, "none")
    return results


def convert(source_path, target_format="webp", quality=85):
    """Convert between formats"""
    ext_map = {"jpeg": ".jpg", "jpg": ".jpg", "webp": ".webp", "png": ".png", "avif": ".avif", "tiff": ".tif"}
    ext = ext_map.get(target_format, f".{target_format}")
    cache_key = hashlib.md5(f"{source_path}{target_format}{quality}".encode()).hexdigest()
    dest = CACHE_DIR / f"conv_{cache_key}{ext}"
    
    if dest.exists():
        return str(dest)
    
    try:
        image = pyvips.Image.new_from_file(str(source_path))
        
        save_opts = {"Q": quality, "strip": True}
        if target_format == "png":
            save_opts["compression"] = 9
        elif target_format == "webp":
            save_opts["lossless"] = False
        
        if target_format in ("jpeg", "jpg"):
            image.jpegsave(str(dest), **save_opts)
        elif target_format == "png":
            image.pngsave(str(dest), **save_opts)
        elif target_format == "webp":
            image.webpsave(str(dest), **save_opts)
        elif target_format == "avif":
            image.heifsave(str(dest), Q=quality)
        elif target_format in ("tiff", "tif"):
            image.tiffsave(str(dest))
        else:
            image.write_to_file(str(dest))
        
        return str(dest)
    except Exception as e:
        return f"error: {e}"


def batch_optimize(paths, max_width=2048, quality=80):
    """Optimize multiple images in batch"""
    return {str(p): optimize(str(p), max_width, quality) for p in paths}


def download_and_optimize(url, max_width=2048, quality=80):
    """Download image from URL and optimize it"""
    import requests
    from io import BytesIO
    
    try:
        resp = requests.get(url, timeout=30, headers={"User-Agent": "Mozilla/5.0"})
        resp.raise_for_status()
        
        cache_key = hashlib.md5(url.encode()).hexdigest()
        raw_path = CACHE_DIR / f"dl_{cache_key}.raw"
        raw_path.write_bytes(resp.content)
        
        image = pyvips.Image.new_from_buffer(resp.content, "")
        image = image.autorot()
        
        if image.width > max_width:
            image = image.resize(max_width / image.width)
        
        dest = CACHE_DIR / f"dl_{cache_key}.webp"
        image.webpsave(str(dest), Q=quality, strip=True)
        return str(dest)
    except Exception as e:
        return f"error: {e}"
