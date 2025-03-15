<template>
    <!-- 显示页面 -->
    <div class="main-show" :style="{ display: outputs.length > 0 ? 'block' : 'none' }">
        <div class="time-spending">
            <div>
                <span v-if="videoIsOn" class="title">{{ costTime ? `摄像头实时预测 (耗时：${costTime}ms)` : '预测结果' }}</span>
                <span v-else class="title">{{ costTime ? `单张图像预测 (耗时：${costTime}ms)` : '预测结果' }}</span>
            </div>
            <el-dropdown @command="handleChangeTopk">
                <el-button plain type="success" size="small">
                    {{ `展示top${topN}` }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item :command="k + 4" v-for="k in 6" :key="k">{{
                            k + 4 }}</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>

        <div class="showOutput">
            <canvas ref="canvasElement" style="display: none;"></canvas>
            <div class="showData">
                <el-empty v-if="!imageFileName && !videoIsOn" description="未上传图片或开启摄像头" />
                <div class="image-video">
                    <img v-if="imageFileName !== ''" :src="imageSrc" width="256" height="256" />
                    <video ref="videoElement" width="256" height="256"
                        :style="{ display: videoIsOn ? 'block' : 'none' }"></video>
                </div>
                <div class="graph">
                    <div id="barGraph" class="barGraph">
                    </div>
                    <ApexCharts width="100%" height="256px" :options="options" :series="series">
                    </ApexCharts>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getTopK, preprocessImage, runInference } from '../utils/transfrom_run.js'
import { Tensor } from 'onnxjs'
import ApexCharts from 'vue3-apexcharts'
const emits = defineEmits(['changeTopN', 'updateOutputs', 'updateCostTime'])
const { outputs,topN, session, globalOutput, idxToLabel, currentStream, videoIsOn, costTime, imageFileName, imageSrc } = defineProps(['outputs','topN','session', 'globalOutput', 'idxToLabel', 'currentStream', 'videoIsOn', 'costTime', 'imageFileName', 'imageSrc'])
const canvasElement = ref(null)
const videoElement = ref(null)
const options = computed(() => {
    return {
        chart: { type: 'bar', height: '100%', width: '100%' },
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: 20,
                dataLabels: {
                    position: 'top' // top, center, bottom
                }
            }
        },
        dataLabels: {
            enable: true,
            formatter: function (val) {
                return `${(val * 100).toFixed(2)}%`
            },
            offsetY: -20,
            style: {
                fontSize: '12px',
                colors: ['#304758']
            }
        },
        xaxis: {
            type: 'category',
            categories: [],
            position: 'bottom',
        },
        yaxis: {
            min: 0, max: 1, labels: {
                show: false,
                formatter: function (val) {
                    return `${(val * 100).toFixed(2)}%`
                }
            }
        },
        colors: ['#409EFF'],
        tooltip: {
            enabled: true
        },
        title: { text: `预测结果Top${topN}`, align: 'center', offsetX: 0, offsetY: 10, style: { fontSize: '20px', fontWeight: 'bold' } },
    }
})
const series = ref([
    {
        data: []
    },
])
watch(() => outputs, (newTopk) => {
    series.value[0].data = newTopk.map(val => {
        return {
            x: val[0],
            y: val[1]
        }
    })
}, {
    deep: true,
    immediate: true
})
// 回掉函数 计算预测时间
const predictionOver = () => {
    const endTime = new Date()
    return endTime
}

// 处理每一帧
const processFrame = async (canvas) => {
    const processedData = preprocessImage(canvas, 256, 256)
    const output = await runInference(session, new Tensor(new Float32Array(processedData.data), 'float32', [1, 3, 256, 256]), predictionOver)
    emits('updateCostTime', output.costTime)
    const topk = getTopK(output.outputTensor, idxToLabel, topN)
    emits('updateOutputs', topk)
}

// 获取每一帧
const captureFrame = async () => {
    const canvas = canvasElement.value
    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height)
    if (videoIsOn) {
        await processFrame(canvas)
        requestAnimationFrame(captureFrame)
    }
}
watch(() => videoIsOn, async (newValue) => {
    console.log(newValue)
    if (newValue) {
        await captureFrame()
        console.log(videoElement.value)
        videoElement.value.srcObject = currentStream
        videoElement.value.play()
    }
}, {
    immediate: true
})

const handleChangeTopk = (k) => {
    emits('changeTopN', k)
    const topk = getTopK(globalOutput.outputTensor, idxToLabel, k)
    series.value[0].data = topk.map(val => {
        return {
            x: val[0],
            y: val[1]
        }
    })
}
</script>

<style scoped lang="scss">
.main-show {
    .time-spending {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 40px;

        .title {
            font-size: 13px;
            font-weight: bold;
            height: 20px;
            display: block;
        }
    }

    .showOutput {
        .showData {
            display: flex;

            .el-empty {
                background-color: #fff;
                width: 250px;
                height: 250px;
            }

            .image-video {
                margin-right: 20px;
            }

            .graph {
                border-radius: 5px;
                background-color: #fff;
                width: 100%;
                height: 256px;
            }
        }
    }
}
</style>