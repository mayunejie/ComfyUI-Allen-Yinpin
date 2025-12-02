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
                                const originalName = file.name; // 【新增】先拿个小本本记下原始名字！

                                btn.name = "⏳ 正在上传...";
                                
                                const formData = new FormData();
                                formData.append("image", file);
                                formData.append("overwrite", "true");
                                
                                // 【昨天成功的关键】这句绝对不能动！
                                // 告诉服务器这是 input 类型，确保 RunningHub 不拦截
                                formData.append("type", "input"); 

                                try {
                                    const resp = await api.fetchApi("/upload/image", {
                                        method: "POST",
                                        body: formData,
                                    });

                                    if (resp.ok) {
                                        const data = await resp.json();
                                        const serverFilename = data.name; // 服务器存的实际名字
                                        
                                        // 1. 更新下拉菜单
                                        const audioWidget = this.widgets.find(w => w.name === "audio");
                                        if (audioWidget) {
                                            if (!audioWidget.options.values.includes(serverFilename)) {
                                                audioWidget.options.values.push(serverFilename);
                                            }
                                            audioWidget.value = serverFilename;
                                        }

                                        // 2. 【新增】把原始名字填入那个“upload_name”文本框
                                        const nameWidget = this.widgets.find(w => w.name === "upload_name");
                                        if (nameWidget) {
                                            nameWidget.value = originalName;
                                            // 触发一下回调，确保系统知道值变了
                                            if (nameWidget.callback) {
                                                nameWidget.callback(originalName);
                                            }
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
