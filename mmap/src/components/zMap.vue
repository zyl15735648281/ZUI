<template>
  <div ref="canvasBox" />
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import CustomMaptalks from '@/utils/CustomMaptalks.js'
const canvasBox = ref(null)
onMounted(() => {
    console.log("这是 map");
    const customMaptalks = CustomMaptalks.getCustomMaptalks(canvasBox.value)
})


</script>

<style lang="scss" scoped>
div {
  background: rgba(17, 31, 55, 1);
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  z-index: 1;
}
</style>
