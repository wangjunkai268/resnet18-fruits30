<template>
  <div class="item">
    <span class="title">{{ title }}</span>
    <slot name="main">

    </slot>
  </div>
</template>

<script setup>
defineProps(['title'])
</script>

<style scoped lang="scss">
.item {
    box-sizing: border-box;
    background-color: #fff;
    border: 1px solid #eee;
    width: 240px;
    height: 120px;
    border-radius: 5px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .title {
      display: block;
      font-size: 14px;
      font-weight: bold;
      padding-bottom: 5px;
      border-bottom: 1px solid #eee;
    }
}
</style>