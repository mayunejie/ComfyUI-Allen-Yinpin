import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

app.registerExtension({
    name: "Allen.Yinpin.UploadButton",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "AllenYinpin") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

                // 添加上传按钮
                const btn = this.addWidget("button", "🎵 点击这里上传音频 (Upload)", null, () => {
                    const fileInput = document.createElement("input");
                    Object.assign(fileInput, {
                        type: "file",
                        accept: ".wav,.mp3,.ogg,.flac,.m4a,.WAV,.MP3",
                        style: "display: none",
                        onchange: async () => {
                            if (fileInput.files.length > 0) {
                                const file = fileInput.files[0];
                                btn.name = "⏳ 正在上传...";
                                
                                const formData = new FormData();
                                formData.append("image", file);
                                formData.append("overwrite", "true");
                                
                                // 【关键修改】这里改成 "input"，伪装成普通输入文件
                                // 服务器这下就不会拒绝了！
                                formData.append("type", "input"); 

                                try {
                                    const resp = await api.fetchApi("/upload/image", {
                                        method: "POST",
                                        body: formData,
                                    });

                                    if (resp.ok) {
                                        const data = await resp.json();
                                        const filename = data.name;
                                        
                                        const widget = this.widgets.find(w => w.name === "audio");
                                        if (widget) {
                                            if (!widget.options.values.includes(filename)) {
                                                widget.options.values.push(filename);
                                            }
                                            widget.value = filename;
                                        }
                                        btn.name = "✅ 上传成功！";
                                        setTimeout(() => { btn.name = "🎵 点击这里上传音频 (Upload)"; }, 2000);
                                    } else {
                                        alert("❌ 上传失败: " + resp.statusText);
                                        btn.name = "❌ 失败";
                                    }
                                } catch (error) {
                                    alert("❌ 出错: " + error);
                                    btn.name = "❌ 出错";
                                }
                            }
                            document.body.removeChild(fileInput);
                        }
                    });
                    document.body.appendChild(fileInput);
                    fileInput.click();
                });
                
                return r;
            };
        }
    }
});
