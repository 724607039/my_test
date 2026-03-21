<template>
  <div class="table-component">
    <div class="table-actions">
      <el-button type="primary" size="small" @click="addRow">
        添加行
      </el-button>
      <el-button type="primary" size="small" @click="addColumn">
        添加列
      </el-button>
      <el-button type="danger" size="small" @click="removeRow">
        删除行
      </el-button>
      <el-button type="danger" size="small" @click="removeColumn">
        删除列
      </el-button>
    </div>
    <table class="editable-table">
      <tbody>
        <tr v-for="(row, rowIndex) in props.data" :key="rowIndex">
          <td
            v-for="(cell, colIndex) in row"
            :key="colIndex"
            contenteditable
            @input="handleCellEdit(rowIndex, colIndex, $event)"
          >
            {{ cell }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  data: {
    type: Array as () => string[][],
    default: () => [
      ['单元格1', '单元格2'],
      ['单元格3', '单元格4'],
    ],
  },
});

const emit = defineEmits(['update:data']);

const addRow = () => {
  const newRow = Array(props.data[0]?.length || 2).fill('');
  const newData = [...props.data, newRow];
  emit('update:data', newData);
};

const addColumn = () => {
  const newData = props.data.map((row) => [...row, '']);
  emit('update:data', newData);
};

const removeRow = () => {
  if (props.data.length > 1) {
    const newData = props.data.slice(0, -1);
    emit('update:data', newData);
  }
};

const removeColumn = () => {
  if (props.data[0] && props.data[0].length > 1) {
    const newData = props.data.map((row) => row.slice(0, -1));
    emit('update:data', newData);
  }
};

const handleCellEdit = (rowIndex: number, colIndex: number, event: Event) => {
  const target = event.target as HTMLElement;
  const newData = [...props.data];
  newData[rowIndex][colIndex] = target.textContent || '';
  emit('update:data', newData);
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

.editable-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ddd;
}

.editable-table td {
  border: 1px solid #ddd;
  padding: 8px;
  min-width: 100px;
  min-height: 30px;
}

.editable-table td[contenteditable] {
  outline: none;
  cursor: text;
}

.editable-table td[contenteditable]:focus {
  background-color: #f0f9ff;
}
</style>
