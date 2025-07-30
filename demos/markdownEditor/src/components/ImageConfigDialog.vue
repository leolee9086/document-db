<template>
  <div v-if="visible" class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <h3>图床配置</h3>
      <div class="form-group">
        <label>图床类型:</label>
        <select v-model="config.type">
          <option value="local">本地存储</option>
          <option value="imgur">Imgur</option>
          <option value="custom">自定义API</option>
        </select>
      </div>
      <div v-if="config.type === 'imgur'" class="form-group">
        <label>Client ID:</label>
        <input v-model="config.imgurClientId" type="text" placeholder="输入Imgur Client ID">
      </div>
      <div v-if="config.type === 'custom'" class="form-group">
        <label>API地址:</label>
        <input v-model="config.customApiUrl" type="text" placeholder="https://api.example.com/upload">
      </div>
      <div class="form-actions">
        <button @click="handleSave">保存</button>
        <button @click="$emit('close')">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ImageConfig } from '../composables/useImageConfig'

const props = defineProps<{
  visible: boolean
  config: ImageConfig
}>()

const emit = defineEmits<{
  close: []
  save: [config: ImageConfig]
}>()

const config = ref<ImageConfig>({ ...props.config })

watch(() => props.config, (newConfig) => {
  config.value = { ...newConfig }
}, { deep: true })

const handleSave = () => {
  emit('save', { ...config.value })
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 400px;
  max-width: 500px;
}

.modal h3 {
  margin-top: 0;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.form-actions button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.form-actions button:first-child {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.form-actions button:first-child:hover {
  background: #0056b3;
}
</style> 