<template>
  <div class="header">
    <span>智能水果识别系统</span><span>本系统已接入<b>DeepSeek-V3</b>，你可以随时随地向DeepSeek提问！</span>
    <span class="login-register">登陆/注册</span>
  </div>
</template>

<script setup>

</script>

<style scoped lang="scss">
.header {
    width: 100%;
    height: 50px;
    box-sizing: border-box;
    border: 1px solid #eee;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 30px;
    padding-right: 30px;
    span {
        color: #409EFF;
        font-size: 16px;
    }
    .login-register {
        cursor: pointer;
        font-size: 15px;
    }
}
</style>