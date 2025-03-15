import ndarray from 'ndarray'
import { Tensor } from 'onnxjs'
import { toSoftmax } from './math'
// 获取图片
export const getImage = (inputFile) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            const image = new Image()
            image.src = e.target.result
            image.onload = resolve(image)
        }
        reader.onerror = (e) => reject(e)
        reader.readAsDataURL(inputFile)
    })
}


export const preprocessImage = (canvas, width, height) => {

    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, width, height);
    
    // 将图像数据转换为 ndarray，形状为 [256, 256, 4] (RGBA)
    const dataFromImage = ndarray(new Uint8Array(imageData.data), [width, height, 4]);
    // 创建输出 ndarray，形状为 [1, 3, 256, 256] (BGR)
    const dataProcessed = ndarray(new Float32Array(width * height * 3), [1, 3, width, height]);

    // 归一化参数（ImageNet 的均值和标准差）
    const mean = [0.485, 0.456, 0.406];
    const std = [0.229, 0.224, 0.225];

    // 遍历每个像素
    for (let y = 0; y < width; y++) {
        for (let x = 0; x < height; x++) {
            // 获取 RGBA 值并归一化到 [0, 1]
            const r = dataFromImage.get(y, x, 0) / 255;
            const g = dataFromImage.get(y, x, 1) / 255;
            const b = dataFromImage.get(y, x, 2) / 255;

            // 应用 ImageNet 归一化
            dataProcessed.set(0, 0, y, x, (r - mean[0]) / std[0]); // R 通道
            dataProcessed.set(0, 1, y, x, (g - mean[1]) / std[1]); // G 通道
            dataProcessed.set(0, 2, y, x, (b - mean[2]) / std[2]); // B 通道
        }
    }

    // 返回预处理后的数据
    return dataProcessed;
}
export const processImage = (image, width, height) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Resize to 256x256
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const prepocessedImage = preprocessImage(canvas, canvas.width, canvas.height)
    return new Tensor(prepocessedImage.data, 'float32', [1, 3, 256, 256])
}
// 获取排名前k
export const getTopK = (data,idx_to_label, k) => {
    const outputArray = Array.from(data)
    // 构造一个概率，下标的数组
    const probIndexArray = outputArray.map((prob, index) => {
        return [prob, index]
    })
    // 排序 从大到小排序
    const sortedArray = probIndexArray.sort(function (a, b) {
        if (a[0] > b[0])
            return 1
        else
            return -1
    }).reverse()
    const probablities = toSoftmax(sortedArray)
    const topk = probablities.slice(0, k).map(value => {
        return [idx_to_label[value[1]], value[0]]
    })
    return topk
}
// 处理
export const runInference = async (model,inputTensor,cb) => {
    // console.log(inputTensor)
    const startTime = new Date()
    const outputMap = await model.run([inputTensor]);
    const outputTensor = outputMap.values().next().value.data
    const endTime = cb ? cb() : null
    const costTime = (endTime - startTime)
    return {
        outputTensor: outputTensor,
        costTime: costTime
    }
}