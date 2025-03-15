<template>
    <div class="main">
        <!-- 功能模块 -->
        <div class="functions">
            <MainItem :title="val" v-for="(val, item) in titles" :key="item">
                <template #main>
                    <div class="custom-input-file" v-if="item === 0">
                        <label for="uploadONNXFile" class="uploadFile">
                            选择文件
                        </label>
                        <span v-if="onnxFileName" class="file-name"><el-text truncated>{{ onnxFileName
                                }}</el-text></span>
                        <input id="uploadONNXFile" type="file" class="input-file" accept=".onnx"
                            @change="handleUploadONNX">
                    </div>

                    <div class="custom-input-file" v-if="item === 1">
                        <label for="uploadClassesFile" :style="{ width: btnWidth }" class="uploadFile">
                            选择文件
                        </label>
                        <span v-if="classesFileName" class="file-name"><el-text truncated>{{ classesFileName
                                }}</el-text></span>
                        <input id="uploadClassesFile" type="file" class="input-file" accept=".json"
                            @change="handleUploadClasses">
                    </div>

                    <div class="custom-input-file" :class="{ 'custom-input-file-column': imageFileName }"
                        v-if="item === 2">
                        <span v-if="imageFileName" class="file-name"><el-text truncated>{{ imageFileName
                                }}</el-text></span>
                        <label for="uploadImage" class="upload-image-file extra-orange">
                            上传图像推理
                        </label>
                        <input id="uploadImage" type="file" class="input-file" accept="image/*"
                            @change="handleInputImage">
                    </div>

                    <div class="custom-input-file" :class="{ 'custom-input-file-column': item === 3 }"
                        v-if="item === 3">
                        <el-dropdown @command="handleCommand">
                            <el-button type="primary" size="small">
                                {{ constraints.video.deviceId ? constraints.video.deviceLabel : '选择摄像头设备' }}<el-icon
                                    class="el-icon--right"><arrow-down /></el-icon>
                            </el-button>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item :command="device" v-for="device in availableDevices"
                                        :key="device.deviceId">{{
                                            device.label }}</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                        <button v-if="!videoIsOn" class="upload-image-file" @click="handleOpenCamera">开启摄像头</button>
                        <button v-else class="use-camera-btn" @click="handleCloseCamera">关闭摄像头</button>
                    </div>
                </template>
            </MainItem>
        </div>
        <!-- 数据展示模块 -->
        <MainShow @updateCostTime="updateCostTime" @updateOutputs="updateOutputs" :topN="topN"
            @changeTopN="receiveChangeTopN" :session="session" :outputs="outputs" :idxToLabel="idxToLabel"
            :globalOutput="globalOutput" :videoIsOn="videoIsOn" :costTime="costTime" :imageFileName="imageFileName"
            :imageSrc="imageSrc" :currentStream="currentStream">
        </MainShow>
        <!-- 资源下载模块 -->
        
        <!-- 用户搜索并且deepseek回答 -->
        <!-- <div class="message">
            <ShowMessage></ShowMessage>
        </div> -->
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { InferenceSession } from 'onnxjs'
import { getImage, processImage, runInference, getTopK } from '../utils/transfrom_run.js'

import MainItem from '../components/MainItem.vue'
import MainShow from '../components/MainShow.vue'
import ShowMessage from '../components/ShowMessage.vue'
import { ElMessage } from 'element-plus'

let session = null
const topN = ref(5)
const btnWidth = ref('100%')
const imageFileName = ref('')
const imageSrc = ref('')
const outputs = ref([])
const onnxFileName = ref('')
const classesFileName = ref('')
const idxToLabel = ref({})
const availableDevices = ref([])
const videoIsOn = ref(false)
const currentStream = ref('')
const costTime = ref(0)
const globalOutput = ref([])
const titles = ref(['1.上传ONNX模型', '2.上传类别文件', '推理预测/单张图像', '推理预测/摄像头实时'])
const constraints = {
    video: { width: 256, height: 256 },
    audio: false
}
onMounted(async () => {
    // 枚举所有媒体设备
    const devices = await navigator.mediaDevices.enumerateDevices()
    availableDevices.value = devices.filter(device => device.kind === 'videoinput')
})
const receiveChangeTopN = (k) => {
    topN.value = k
}
const updateOutputs = (videoOutputs) => {
    outputs.value = videoOutputs
}
const updateCostTime = (newCostTime) => {
    costTime.value = newCostTime
}
// 选择摄像头
const handleCommand = async (device) => {
    // 是当前在使用的摄像头就不更新
    if (device.deviceId !== constraints.video.deviceId) {
        constraints.video.deviceId = device.deviceId ? device.deviceId : undefined
        constraints.video.deviceLabel = device.label
        // 如果没有开启就不开启摄像头 只更换设备
        if (videoIsOn.value) {
            await handleCloseCamera()
            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            currentStream.value = stream
            videoIsOn.value = true
        }
    }
}
// 关闭摄像头
const handleCloseCamera = async () => {
    // 停止现在的摄像头
    const tracks = currentStream.value.getTracks()
    tracks.forEach(track => track.stop())
    videoIsOn.value = false
    outputs.value = []
}
const handleUploadONNX = async (e) => {
    const uploadFile = e.target.files[0]
    onnxFileName.value = uploadFile.name
    try {
        session = new InferenceSession()
        await session.loadModel('/' + onnxFileName.value)
        console.log('successful');
    } catch (e) {
        console.log('error:' + e);
    } finally {
        console.log('loading');
    }
}

const handleUploadClasses = (e) => {
    const uploadFile = e.target.files[0]
    classesFileName.value = uploadFile.name
    btnWidth.value = 70 + 'px'
    const reader = new FileReader()
    try {
        reader.onload = (e) => {
            const text = e.target.result
            idxToLabel.value = JSON.parse(text)
        }
        reader.readAsText(uploadFile)
    } catch (e) {
        console.log(e)
    }
}

// 输入图片
const handleInputImage = async (e) => {
    if (onnxFileName.value === '' || classesFileName.value === '') {
        if (onnxFileName.value === '') ElMessage({
            message: '请先上传ONNX模型文件！',
            type: 'error'
        })
        else if (classesFileName.value === '') ElMessage({
            message: '请先上传类别文件！',
            type: 'error'
        })
        document.getElementById('uploadImage').value = ''
        return;
    }
    topN.value = 5
    const imageFile = e.target.files[0]
    imageFileName.value = imageFile.name
    console.log(videoIsOn.value)
    if (videoIsOn.value) await handleCloseCamera()
    console.log(videoIsOn.value)
    // 显示在网页中
    imageSrc.value = URL.createObjectURL(imageFile)
    // 获取到了图片
    const image = await getImage(imageFile)
    // 获取预处理后的图片
    const inputTensor = processImage(image, 256, 256)
    // 获得处理后的结果
    const output = await runInference(session, inputTensor, predictionOver)
    globalOutput.value = output
    costTime.value = output.costTime
    // 获取概率最大的前五
    const topk = getTopK(output.outputTensor, idxToLabel.value, 5)
    outputs.value = topk
}
// 回掉函数 计算预测时间
const predictionOver = () => {
    const endTime = new Date()
    return endTime
}
// 开启视频
const handleOpenCamera = async () => {
    if (onnxFileName.value === '' || classesFileName.value === '' || constraints.video.deviceId === undefined) {
        if (onnxFileName.value === '') ElMessage({
            message: '请先上传ONNX模型文件！',
            type: 'error'
        })
        else if (classesFileName.value === '') ElMessage({
            message: '请先上传类别文件！',
            type: 'error'
        })
        else if (constraints.video.deviceId === undefined) ElMessage({
            message: '请先选择使用哪个摄像头设备！',
            type: 'error'
        })
        return;
    }
    try {
        topN.value = 5
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        currentStream.value = stream
        const tracks = currentStream.value.getVideoTracks()
        if (tracks.length > 0 && tracks[0].readyState === 'live')
            videoIsOn.value = true
        if (imageFileName.value) {
            imageFileName.value = ''
            document.getElementById('uploadImage').value = ''
        }
    } catch (e) {
        if (e.name === 'NotAllowedError') ElMessage({
            message: '用户拒绝访问摄像头！',
            type: 'error'
        })
    }
}
</script>

<style scoped lang="scss">
.main {
    padding: 10px 15px;

    .el-text {
        color: #000000;
    }

    .functions {
        width: 100%;
        // width: 500px;
        height: 120px;
        display: flex;
        // flex-wrap: wrap;
        // flex: 25%;
        justify-content: space-between;
        align-content: space-between;

        .custom-input-file {
            display: flex;
            justify-content: center;
            align-items: end;
            height: 60px;

            .el-button--small {
                font-size: 11px;
            }

            .uploadFile {
                font-size: 11px;
                border: 1px solid #eee;
                border-radius: 10px;
                width: 90%;
                background-color: rgba($color: #409EFF, $alpha: 0.2);
                color: #409EFF;
                cursor: pointer;
                padding: 4px 8px;
                margin-right: 10px;
                text-align: center;
            }

            .upload-image-file {
                font-size: 11px;
                border: 1px solid #eee;
                border-radius: 5px;
                background-color: rgba($color: #53bb1f, $alpha: 0.2);
                color: #53bb1f;
                cursor: pointer;
                display: block;
                width: 90%;
                padding: 4px 0;
                border-radius: 10px;
                text-align: center;
                margin-right: 0;
            }

            .extra-orange {
                background-color: rgba($color: #FF7C00, $alpha: 0.2);
                color: #FF7C00;
            }

            .use-camera-btn {
                font-size: 11px;
                border: 1px solid #eee;
                border-radius: 5px;
                background-color: rgba($color: #F56C6C, $alpha: 0.2);
                color: #F56C6C;
                cursor: pointer;
                display: block;
                width: 90%;
                padding: 4px 0;
                border-radius: 10px;
                text-align: center;
                margin-right: 0;
            }

            .input-file {
                display: none;
            }

            .file-name {
                display: block;
                width: 140px;
                height: 25px;
                text-align: right;
                line-height: 25px;

                .el-text {
                    font-size: 12px;
                }
            }
        }

        .custom-input-file-column {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;

            .file-name {
                text-align: center;

                .el-text {
                    font-size: 12px;
                }
            }
        }
    }
}
</style>