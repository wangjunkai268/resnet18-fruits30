<template>
    <el-container class="page-container">
      <el-header class="header">
        <h1>智能图像识别系统</h1>
      </el-header>
      <el-main class="main-content">
        <!-- 四个步骤块 -->
        <el-row :gutter="20" class="steps-section">
          <el-col :span="6">
            <el-card class="step-card" shadow="hover">
              <el-upload action="#" :on-change="handleOnnxUpload" :show-file-list="false">
                <el-button type="primary" icon="el-icon-upload">上传 ONNX 模型文件</el-button>
              </el-upload>
              <p v-if="onnxFile" class="file-name">{{ onnxFile.name }}</p>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="step-card" shadow="hover">
              <el-upload action="#" :on-change="handleJsonUpload" :show-file-list="false">
                <el-button type="primary" icon="el-icon-upload">上传 JSON 文件</el-button>
              </el-upload>
              <p v-if="jsonFile" class="file-name">{{ jsonFile.name }}</p>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="step-card" shadow="hover">
              <el-upload action="#" :on-change="handleImageUpload" :show-file-list="false">
                <el-button type="primary" icon="el-icon-upload">上传单张图片</el-button>
              </el-upload>
              <p v-if="imageFile" class="file-name">{{ imageFile.name }}</p>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="step-card" shadow="hover">
              <el-button type="primary" icon="el-icon-video-camera" @click="openCamera">开启摄像头</el-button>
            </el-card>
          </el-col>
        </el-row>
  
        <!-- 图片预测结果模块 -->
        <el-card v-if="showPrediction" class="prediction-section" shadow="hover">
          <h2>图片预测结果</h2>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-image :src="predictedImage" fit="cover" class="prediction-image" />
              <video v-if="cameraStream" :srcObject="cameraStream" autoplay class="prediction-video" />
            </el-col>
            <el-col :span="12">
              <el-table :data="predictionData" style="width: 100%" stripe>
                <el-table-column prop="label" label="标签" />
                <el-table-column prop="confidence" label="置信度" />
              </el-table>
            </el-col>
          </el-row>
        </el-card>
  
        <!-- DeepSeek 问答模块 -->
        <el-card class="deepseek-section" shadow="hover">
          <h2>本系统已接入 DeepSeek-V3，你可以随时随地向 DeepSeek 提问！</h2>
          <el-input v-model="searchQuery" placeholder="请输入问题" @keyup.enter="searchDeepSeek" class="search-input">
            <template #append>
              <el-button type="primary" icon="el-icon-search" @click="searchDeepSeek" />
            </template>
          </el-input>
          <el-divider />
          <div v-if="searchResults">
            <h3>搜索结果：</h3>
            <p>{{ searchResults }}</p>
          </div>
          <div v-else>
            <h3>推荐问题：</h3>
            <ul class="recommend-questions">
              <li v-for="(question, index) in randomQuestions" :key="index">{{ question }}</li>
            </ul>
          </div>
        </el-card>
  
        <!-- 文件下载模块 -->
        <el-card class="download-section" shadow="hover">
          <h2>文件下载</h2>
          <el-button type="primary" icon="el-icon-download" @click="downloadOnnx">下载 ONNX 模型</el-button>
          <el-button type="primary" icon="el-icon-download" @click="downloadJson">下载 JSON 文件</el-button>
          <el-button type="primary" icon="el-icon-download" @click="downloadExampleImages">下载示例水果图片</el-button>
        </el-card>
      </el-main>
    </el-container>
  </template>
  
  <script>
  import { ref } from 'vue';
  
  export default {
    setup() {
      const onnxFile = ref(null);
      const jsonFile = ref(null);
      const imageFile = ref(null);
      const cameraStream = ref(null);
      const searchQuery = ref('');
      const searchResults = ref('');
      const randomQuestions = ref([
        '如何提高图像识别准确率？',
        'DeepSeek 支持哪些模型格式？',
        '如何优化 ONNX 模型？',
      ]);
      const predictedImage = ref('');
      const predictionData = ref([]);
      const showPrediction = ref(false);
  
      const handleOnnxUpload = (file) => {
        onnxFile.value = file;
      };
  
      const handleJsonUpload = (file) => {
        jsonFile.value = file;
      };
  
      const handleImageUpload = (file) => {
        imageFile.value = file;
        showPrediction.value = true;
        predictedImage.value = URL.createObjectURL(file);
        // 模拟预测数据
        predictionData.value = [
          { label: '苹果', confidence: '95%' },
          { label: '香蕉', confidence: '80%' },
        ];
      };
  
      const openCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          cameraStream.value = stream;
          showPrediction.value = true;
        } catch (error) {
          console.error('无法开启摄像头:', error);
        }
      };
  
      const searchDeepSeek = () => {
        // 模拟搜索
        searchResults.value = `你搜索了：${searchQuery.value}`;
      };
  
      const downloadOnnx = () => {
        // 模拟下载
        alert('下载 ONNX 模型');
      };
  
      const downloadJson = () => {
        // 模拟下载
        alert('下载 JSON 文件');
      };
  
      const downloadExampleImages = () => {
        // 模拟下载
        alert('下载示例水果图片');
      };
  
      return {
        onnxFile,
        jsonFile,
        imageFile,
        cameraStream,
        searchQuery,
        searchResults,
        randomQuestions,
        predictedImage,
        predictionData,
        showPrediction,
        handleOnnxUpload,
        handleJsonUpload,
        handleImageUpload,
        openCamera,
        searchDeepSeek,
        downloadOnnx,
        downloadJson,
        downloadExampleImages,
      };
    },
  };
  </script>
  
  <style scoped>
  .page-container {
    padding: 20px;
    background-color: #f5f7fa;
  }
  
  .header {
    text-align: center;
    margin-bottom: 20px;
    font-size: 24px;
    color: #303133;
  }
  
  .main-content {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .steps-section {
    margin-bottom: 30px;
  }
  
  .step-card {
    text-align: center;
    padding: 20px;
    border-radius: 8px;
    transition: transform 0.3s ease;
  }
  
  .step-card:hover {
    transform: translateY(-5px);
  }
  
  .file-name {
    margin-top: 10px;
    font-size: 14px;
    color: #666;
  }
  
  .prediction-section {
    margin-bottom: 30px;
    padding: 20px;
    border-radius: 8px;
  }
  
  .prediction-image {
    width: 100%;
    height: 200px;
    border-radius: 8px;
  }
  
  .prediction-video {
    width: 100%;
    height: 200px;
    border-radius: 8px;
    background-color: #000;
  }
  
  .deepseek-section {
    margin-bottom: 30px;
    padding: 20px;
    border-radius: 8px;
  }
  
  .search-input {
    margin-bottom: 20px;
  }
  
  .recommend-questions {
    list-style: none;
    padding: 0;
  }
  
  .recommend-questions li {
    margin-bottom: 10px;
    color: #606266;
  }
  
  .download-section {
    padding: 20px;
    border-radius: 8px;
  }
  
  .el-button {
    margin-right: 10px;
  }
  </style>