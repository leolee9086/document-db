<template>
  <div class="toolbar">
    <button @click="$emit('import')" :disabled="isLoading">导入文件</button>
    <button @click="$emit('export')" :disabled="isLoading">导出文件</button>
    <button @click="$emit('save-with-data')" :disabled="isLoading">保存包含数据</button>
    <button @click="$emit('save-without-data')" :disabled="isLoading">保存空编辑器</button>
    <button @click="$emit('toggle-encryption')" :disabled="isLoading">
      {{ isEncrypted ? '解密' : '加密' }}
    </button>
    <button @click="$emit('show-image-config')" :disabled="isLoading">
      图床配置
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isLoading: boolean
  isEncrypted: boolean
}>()

defineEmits<{
  import: []
  export: []
  'save-with-data': []
  'save-without-data': []
  'toggle-encryption': []
  'show-image-config': []
}>()
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.toolbar button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.toolbar button:hover:not(:disabled) {
  background: #f0f0f0;
}

.toolbar button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 