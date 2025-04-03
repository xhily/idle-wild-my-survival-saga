<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()

// 资源列表
const basicResources = computed(() => [
  { key: 'food', name: '食物', icon: '🍖' },
  { key: 'water', name: '水', icon: '💧' },
  { key: 'wood', name: '木材', icon: '🌲' },
  { key: 'stone', name: '石头', icon: '🗿' },
  { key: 'metal', name: '金属', icon: '⚙️' },
  { key: 'herb', name: '草药', icon: '🌿' },
])

const advancedResources = computed(() => [
  { key: 'medicine', name: '药品', icon: '💊' },
  { key: 'tools', name: '工具', icon: '🔨' },
  { key: 'parts', name: '零件', icon: '🔧' },
  { key: 'fuel', name: '燃料', icon: '⛽' },
])

const specialResources = computed(() => [
  { key: 'ancientRelic', name: '古代遗物', icon: '🏺' },
  { key: 'techFragment', name: '科技碎片', icon: '💾' },
])

// 获取资源数量
const getResourceAmount = (key) => {
  return gameStore.resources[key]
}

// 获取资源上限
const getResourceLimit = (key) => {
  return gameStore.resourceLimits[key]
}

// 计算资源百分比
const getResourcePercentage = (key) => {
  const amount = getResourceAmount(key)
  const limit = getResourceLimit(key)
  return (amount / limit) * 100
}
</script>

<template>
  <div class="resource-panel">
    <h3>资源</h3>
    <div class="resource-section">
      <h4>基础资源</h4>
      <div class="resource-grid">
        <div v-for="resource in basicResources" :key="resource.key" class="resource-item">
          <div class="resource-icon">{{ resource.icon }}</div>
          <div class="resource-info">
            <div class="resource-name">{{ resource.name }}</div>
            <el-progress :percentage="getResourcePercentage(resource.key)"
              :format="() => `${getResourceAmount(resource.key)}/${getResourceLimit(resource.key)}`" :stroke-width="10"
              :color="getResourcePercentage(resource.key) < 20 ? '#F56C6C' : ''" />
          </div>
        </div>
      </div>
    </div>
    <div class="resource-section" v-if="gameStore.skills.crafting >= 2">
      <h4>高级资源</h4>
      <div class="resource-grid">
        <div v-for="resource in advancedResources" :key="resource.key" class="resource-item">
          <div class="resource-icon">{{ resource.icon }}</div>
          <div class="resource-info">
            <div class="resource-name">{{ resource.name }}</div>
            <el-progress :percentage="getResourcePercentage(resource.key)"
              :format="() => `${getResourceAmount(resource.key)}/${getResourceLimit(resource.key)}`"
              :stroke-width="10" />
          </div>
        </div>
      </div>
    </div>
    <div class="resource-section" v-if="gameStore.skills.research >= 3">
      <h4>特殊资源</h4>
      <div class="resource-grid">
        <div v-for="resource in specialResources" :key="resource.key" class="resource-item">
          <div class="resource-icon">{{ resource.icon }}</div>
          <div class="resource-info">
            <div class="resource-name">{{ resource.name }}</div>
            <el-progress :percentage="getResourcePercentage(resource.key)"
              :format="() => `${getResourceAmount(resource.key)}/${getResourceLimit(resource.key)}`" :stroke-width="10"
              color="#67C23A" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.resource-panel {
  background-color: var(--el-bg-color-overlay);
  border-radius: 4px;
  padding: 10px;
}

.resource-section {
  margin-bottom: 15px;
}

.resource-section h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1em;
  color: var(--el-text-color-secondary);
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.resource-item {
  display: flex;
  align-items: center;
  padding: 5px;
  border-radius: 4px;
  background-color: var(--el-bg-color);
  transition: background-color 0.3s;
}

.resource-item:hover {
  background-color: var(--el-fill-color-light);
}

.resource-icon {
  font-size: 1.5em;
  margin-right: 10px;
  width: 30px;
  text-align: center;
}

.resource-info {
  flex: 1;
}

.resource-name {
  font-size: 0.9em;
  margin-bottom: 5px;
}
</style>