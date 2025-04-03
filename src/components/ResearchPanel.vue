<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { ElMessage } from 'element-plus'

const gameStore = useGameStore()

// 当前选中的科技
const selectedTech = ref(null)

// 可研究的科技
const availableTechnologies = computed(() => {
  return gameStore.technologies.filter(tech => {
    // 过滤未研究且满足前置条件的科技
    if (tech.researched) return false
    // 检查前置科技要求
    if (tech.requirements) {
      for (const reqTech of tech.requirements) {
        const prerequisite = gameStore.technologies.find(t => t.id === reqTech)
        if (!prerequisite || !prerequisite.researched) return false
      }
    }
    return true
  })
})

// 已研究的科技
const researchedTechnologies = computed(() => {
  return gameStore.technologies.filter(tech => tech.researched)
})

// 检查是否有足够的资源研究科技
const canResearch = computed(() => {
  if (!selectedTech.value) return false
  const tech = gameStore.technologies.find(t => t.id === selectedTech.value)
  if (!tech || tech.researched) return false
  // 检查资源
  for (const [resource, amount] of Object.entries(tech.cost)) {
    if (gameStore.resources[resource] < amount) return false
  }
  return true
})

// 获取科技成本文本
const getTechCost = (tech) => {
  if (!tech.cost || Object.keys(tech.cost).length === 0) return '无消耗'
  return Object.entries(tech.cost).map(([resource, amount]) => {
    return `${gameStore.getResourceName(resource)}x${amount}`
  }).join(', ')
}

// 研究选中的科技
const researchTech = () => {
  if (!selectedTech.value || !canResearch.value) return
  const tech = gameStore.technologies.find(t => t.id === selectedTech.value)
  // 消耗资源
  for (const [resource, amount] of Object.entries(tech.cost)) {
    gameStore.consumeResource(resource, amount)
  }
  // 标记为已研究
  tech.researched = true
  // 增加研究技能经验
  gameStore.addSkillExp('research', 2)
  // 添加事件日志
  gameStore.addToEventLog(`你成功研究了${tech.name}！`)
  ElMessage.success(`研究成功：${tech.name}`)
  // 重置选中
  selectedTech.value = null
}

// 获取科技解锁内容文本
const getTechUnlocks = (tech) => {
  if (!tech.unlocks || tech.unlocks.length === 0) return '无特殊解锁'
  const unlockTexts = []
  for (const unlockId of tech.unlocks) {
    // 检查是否解锁了新科技
    const unlockedTech = gameStore.technologies.find(t => t.id === unlockId)
    if (unlockedTech) {
      unlockTexts.push(`科技: ${unlockedTech.name}`)
      continue
    }
    // 检查是否解锁了新配方
    const unlockedRecipes = gameStore.recipes.filter(r => r.techRequired === tech.id)
    for (const recipe of unlockedRecipes) {
      unlockTexts.push(`配方: ${recipe.name}`)
    }
  }
  return unlockTexts.length > 0 ? unlockTexts.join(', ') : '无特殊解锁'
}
</script>

<template>
  <el-scrollbar class="research-panel">
    <div class="tech-tree">
      <div class="tech-categories">
        <h4>可研究科技</h4>
        <div class="tech-list">
          <div v-for="tech in availableTechnologies" :key="tech.id" class="tech-card"
            :class="{ 'selected': selectedTech === tech.id }" @click="selectedTech = tech.id">
            <div class="tech-name">{{ tech.name }}</div>
            <div class="tech-description">{{ tech.description }}</div>
            <div class="tech-cost">需要: {{ getTechCost(tech) }}</div>
          </div>
          <div v-if="availableTechnologies.length === 0" class="no-tech-message">
            当前没有可研究的科技
          </div>
        </div>
        <h4>已研究科技</h4>
        <div class="tech-list researched">
          <div v-for="tech in researchedTechnologies" :key="tech.id" class="tech-card researched">
            <div class="tech-name">{{ tech.name }}</div>
            <div class="tech-description">{{ tech.description }}</div>
            <div class="tech-unlocks">解锁: {{ getTechUnlocks(tech) }}</div>
          </div>
          <div v-if="researchedTechnologies.length === 0" class="no-tech-message">
            尚未研究任何科技
          </div>
        </div>
      </div>
    </div>
    <div v-if="selectedTech" class="tech-details">
      <h4>科技详情</h4>
      <div class="selected-tech">
        <div class="tech-name">
          {{gameStore.technologies.find(t => t.id === selectedTech).name}}
        </div>
        <div class="tech-description">
          {{gameStore.technologies.find(t => t.id === selectedTech).description}}
        </div>
        <div class="tech-requirements">
          <div class="tech-cost">
            需要资源: {{getTechCost(gameStore.technologies.find(t => t.id === selectedTech))}}
          </div>
          <div class="tech-unlocks">
            解锁: {{getTechUnlocks(gameStore.technologies.find(t => t.id === selectedTech))}}
          </div>
        </div>
        <div class="tech-actions">
          <el-button type="primary" @click="researchTech" :disabled="!canResearch">
            {{ canResearch ? '研究' : '资源不足' }}
          </el-button>
        </div>
      </div>
    </div>
  </el-scrollbar>
</template>

<style scoped>
.research-panel {
  background-color: var(--el-bg-color-overlay);
  border-radius: 4px;
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.research-panel h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.tech-tree {
  flex: 1;
  overflow-y: auto;
}

.tech-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.tech-card {
  background-color: var(--el-bg-color);
  border-radius: 4px;
  padding: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
  border-left: 4px solid #909399;
}

.tech-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.2);
}

.tech-card.selected {
  border-left: 4px solid #409EFF;
  background-color: var(--el-color-primary-light-9);
}

.tech-card.researched {
  border-left: 4px solid #67C23A;
  opacity: 0.8;
  cursor: default;
}

.tech-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.tech-description {
  font-size: 0.9em;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.tech-cost,
.tech-unlocks {
  font-size: 0.85em;
  color: var(--el-text-color-secondary);
}

.tech-details {
  margin-top: 20px;
  padding: 15px;
  background-color: var(--el-bg-color);
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.tech-requirements {
  margin: 10px 0;
}

.tech-actions {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.no-tech-message {
  grid-column: 1 / -1;
  padding: 15px;
  text-align: center;
  color: var(--el-text-color-secondary);
  font-style: italic;
}

@media (max-width: 768px) {
  .tech-list {
    grid-template-columns: 1fr;
  }
}
</style>