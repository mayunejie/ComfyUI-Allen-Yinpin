import os
import torch
import torchaudio
import folder_paths

# ================= 权限补丁 (严格保留昨天的设置) =================
# 这一步依然需要，确保节点能识别 input 文件夹里的 .wav .mp3 等文件
audio_extensions = {
    '.wav', '.mp3', '.ogg', '.flac', '.aiff', '.aif', '.m4a',
    '.WAV', '.MP3', '.OGG', '.FLAC', '.AIFF', '.AIF', '.M4A'
}
input_dir = folder_paths.get_input_directory()

# 注册 audio 类型，让它指向 input 文件夹
if "audio" not in folder_paths.folder_names_and_paths:
    folder_paths.folder_names_and_paths["audio"] = ([input_dir], audio_extensions)
else:
    path_list, ext_set = folder_paths.folder_names_and_paths["audio"]
    if input_dir not in path_list:
        path_list.append(input_dir)
    folder_paths.folder_names_and_paths["audio"] = (path_list, ext_set | audio_extensions)
# =============================================================

class AllenYinpin:
    @classmethod
    def INPUT_TYPES(s):
        files = folder_paths.get_filename_list("audio")
        return {
            "required": {
                "audio": (sorted(files), ),
            },
            # 【新增】这里加了一个隐藏的“记事本”，用来存原始文件名
            "optional": {
                "upload_name": ("STRING", {"default": "", "multiline": False}),
            }
        }

    RETURN_TYPES = ("AUDIO", "STRING")
    RETURN_NAMES = ("audio", "filename_text")
    FUNCTION = "load_audio_with_name"
    CATEGORY = "Allen"

    def load_audio_with_name(self, audio, upload_name=""):
        audio_path = folder_paths.get_annotated_filepath(audio)
        try:
            waveform, sample_rate = torchaudio.load(audio_path)
        except:
            # 容错静音
            waveform = torch.zeros((1, 44100))
            sample_rate = 44100
            
        audio_obj = {"waveform": waveform.unsqueeze(0), "sample_rate": sample_rate}
        
        # 【核心修改】逻辑判断
        # 如果 upload_name 里有字（JS 填进去的），就优先用它作为输出
        if upload_name and upload_name.strip() != "":
            final_name = os.path.splitext(upload_name)[0]
        else:
            # 否则还是读硬盘上的文件名（兜底方案）
            final_name = os.path.splitext(os.path.basename(audio_path))[0]

        return (audio_obj, final_name)
