<template>
  <div v-if="visible" class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <h3>{{ isEncrypted ? '解密文档' : '加密文档' }}</h3>
      <div class="form-group">
        <label>密码:</label>
        <input v-model="password" type="password" placeholder="输入密码" @keyup.enter="handleConfirm">
      </div>
      <div class="form-actions">
        <button @click="handleConfirm">{{ isEncrypted ? '解密' : '加密' }}</button>
        <button @click="$emit('close')">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  visible: boolean
  isEncrypted: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: [password: string]
}>()

const password = ref('')

watch(() => props.visible, (visible) => {
  if (visible) {
    password.value = ''
  }
})

const handleConfirm = () => {
  if (!password.value) {
    alert('请输入密码')
    return
  }
  emit('confirm', password.value)
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

.form-group input {
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