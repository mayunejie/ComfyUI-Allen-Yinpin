from .allen_yinpin import AllenYinpin

NODE_CLASS_MAPPINGS = {
    "AllenYinpin": AllenYinpin
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "AllenYinpin": "Allen Load Audio (Yinpin)"
}

# 这一行至关重要！告诉 ComfyUI 前端去哪里找 JS 文件
WEB_DIRECTORY = "./js"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
