<template>
  <div class="table-component">
    <div class="table-actions">
      <button @click="addRow">添加行</button>
      <button @click="removeRow">删除行</button>
      <button @click="addColumn">添加列</button>
      <button @click="removeColumn">删除列</button>
    </div>
    <table>
      <tbody>
        <tr v-for="(row, rowIndex) in localData" :key="rowIndex">
          <td v-for="(cell, cellIndex) in row" :key="cellIndex">
            <input
              v-model="localData[rowIndex][cellIndex]"
              type="text"
              class="table-cell-input"
              @input="updateData"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { defineProps, ref, watch } from 'vue';

const props = defineProps({
  data: {
    type: Array,
    default: () => [
      [1, 2],
      [3, 4],
    ],
  },
});

const emit = defineEmits(['update:data']);

const localData = ref(JSON.parse(JSON.stringify(props.data)));

watch(
  () => props.data,
  (newValue) => {
    localData.value = JSON.parse(JSON.stringify(newValue));
  }
);

const updateData = () => {
  emit('update:data', JSON.parse(JSON.stringify(localData.value)));
};

const addRow = () => {
  const columns = localData.value[0]?.length || 2;
  const newRow = Array(columns).fill('');
  localData.value.push(newRow);
  updateData();
};

const removeRow = () => {
  if (localData.value.length > 1) {
    localData.value.pop();
    updateData();
  }
};

const addColumn = () => {
  localData.value.forEach((row) => {
    row.push('');
  });
  updateData();
};

const removeColumn = () => {
  if (localData.value[0]?.length > 1) {
    localData.value.forEach((row) => {
      row.pop();
    });
    updateData();
  }
};
</script>

<style scoped>
.table-component {
  padding: 10px;
}

.table-actions {
  margin-bottom: 10px;
  display: flex;
  gap: 10px;
}

.table-actions button {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 12px;
}

.table-actions button:hover {
  background-color: #e0e0e0;
}

.table-component table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-component td {
  border: 1px solid #ddd;
  padding: 4px;
  text-align: center;
  min-width: 80px;
}

.table-cell-input {
  width: 100%;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.table-cell-input:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}
</style>
