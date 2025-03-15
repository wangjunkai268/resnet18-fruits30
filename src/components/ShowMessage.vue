<template>
    <div class="main-show">
        <div class="search">
            <input type="text" class="input" placeholder="请输入你的问题" />
            <button class="searchBtn">问一问</button>
        </div>
        <div class="show-message" v-loading="isLoading" element-loading-text="DeepSeek思考中...">
            <!-- 默认界面 -->
            <div class="message" v-if="!msg">
                <span>例如你可以问DeepSeek：</span>
                <ul class="examples" @click="handleSend">
                    <li class="question" v-for="(question, index) in questions" :key="index">{{ question }}</li>
                </ul>
            </div>
            <el-scrollbar v-else class="response">
                <div class="title">
                    <span>{{ q }}</span>
                    <span @click="msg = ''">&times;</span>
                </div>
                <div class="content">
                    <span>回答：</span>
                    <span>&nbsp;&nbsp;{{ msg }}</span>
                </div>
            </el-scrollbar>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { sendQuestion } from '../utils/deepseek'
import fruitQuestions from '../assets/fruits_questions.json'
const msg = ref('')
const questions = ref([])
const q = ref('')
const isLoading = ref(false)
onMounted(() => {
    getRandomQuestions(6)
})
const getRandomQuestions = (number) => {
    const values = Object.values(fruitQuestions)
    while (questions.value.length < number) {
        const index = Math.ceil(Math.random() * 100)
        if (!questions.value.includes(questions.value[index]))
            questions.value.push(fruitQuestions[index])
    }
}
// 回掉函数
const callback = (error, response) => {
    if (error) console.log(error)
    if (response) {
        msg.value = response.choices[0].message.content
        console.log(response)
        isLoading.value = false
    }
}
const handleSend = async (e) => {
    const element = e.target
    isLoading.value = true
    if (element.tagName === 'LI') {
        q.value = element.innerHTML
        await sendQuestion(element.innerHTML, 'LI', callback)
    }
}
getRandomQuestions(6)
</script>

<style scoped lang="scss">
.main-show {
    padding-top: 0;
    border-radius: 5px;
    box-shadow: 0 0 5px 5px rgba(0, 0, 0, 0.1);
    margin-top: 20px;
    width: 100%;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-evenly;

    .search {
        height: 40px;
        margin-bottom: 10px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;

        .input {
            width: 251px;
            box-sizing: border-box;
            padding: 10px;
            border-radius: 5px 0 0 5px;
            border: 1px solid #ccc;
            border-right: 0;
            outline: none;
        }

        .searchBtn {
            display: inline-block;
            background-color: #007bff;
            color: #fff;
            padding: 10px 20px;
            border: 0;
            border-radius: 0 5px 5px 0;
            border: none;
            cursor: pointer;
        }

        .searchBtn:hover {
            background-color: #0056b3;
        }

        .input:hover {
            border: 1px solid #007bff;
        }

        .input:focus {
            border: 1px solid #007bff;
        }
    }


    .show-message {
        width: 50%;
        height: calc(100% - 130px);
        border-radius: 5px;
        text-align: center;

        .message {
            text-align: left;
            padding: 5px 10px;

            span {
                display: block;
            }

            >span:nth-of-type(1) {
                font-size: 14px;
                font-weight: bold;
            }

            .examples {
                display: flex;
                justify-content: space-evenly;
                flex-wrap: wrap;
                text-align: left;
                margin: 0;

                .question {
                    color: #007bff;
                    font-size: 14px;
                    width: 45%;
                    height: 20px;
                    padding: 5px;
                    cursor: pointer;
                }
            }
        }

        .response {
            text-align: left;

            .title {
                background-color: white;
                padding: 10px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                margin-bottom: 10px;
                display: flex;
                justify-content: space-between;

                span {
                    color: #007bff;
                    font-weight: bold;
                    font-size: 20px;
                }

                >span:nth-of-type(2) {
                    cursor: pointer;
                }
            }

            .content {
                border-radius: 5px;
                background-color: #fff;
                box-shadow: 0 0 5px 6px rgba(0, 0, 0, 0.1);
                padding: 10px;

                >span:nth-of-type(1) {
                    display: block;
                    color: #28a745;
                    font-weight: bold;
                    font-family: Arial, sans-serif;
                    font-size: 16px;
                    margin-bottom: 5px;
                }
            }
        }
    }
}
</style>