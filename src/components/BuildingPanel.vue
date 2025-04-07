<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { availableBuildings } from '../plugins/recipes'

const gameStore = useGameStore()

// 建筑列表
const buildings = computed(() => {
  return availableBuildings.filter(building => canSeeBuilding(building))
})

// 检查是否满足建筑的技能要求
const canSeeBuilding = (building) => {
  // 获取建筑的第一级所需技能
  const firstLevel = building.levels[0]
  if (!firstLevel.requirements) return true
  // 检查是否满足所有技能要求
  for (const [skill, level] of Object.entries(firstLevel.requirements)) {
    if (gameStore.skills[skill] < level) return false
  }
  return true
}

// 获取建筑当前等级
const getBuildingLevel = (buildingId) => {
  const existingBuilding = gameStore.buildings.find(b => b.id === buildingId)
  return existingBuilding ? existingBuilding.level : 0
}

// 检查是否可以建造或升级
const canBuildOrUpgrade = (building) => {
  const currentLevel = getBuildingLevel(building.id)
  // 如果已经是最高级，则不能再升级
  if (currentLevel >= building.levels.length) return false
  // 获取下一级所需资源和技能
  const nextLevel = building.levels[currentLevel]
  // 检查技能要求
  for (const [skill, level] of Object.entries(nextLevel.requirements)) {
    if (gameStore.skills[skill] < level) return false
  }
  // 检查资源要求
  for (const [resource, amount] of Object.entries(nextLevel.cost)) {
    if (gameStore.resources[resource] < amount) return false
  }
  return true
}

// 建造或升级建筑
const buildOrUpgrade = (building) => {
  const currentLevel = getBuildingLevel(building.id)
  const level = currentLevel ? currentLevel + 1 : 1
  // 应用建筑效果
  gameStore.buildNewBuilding(building.id, level)
}

// 获取建筑状态文本
const getBuildingStatusText = (building) => {
  const currentLevel = getBuildingLevel(building.id)
  if (currentLevel === 0) return '未建造'
  if (currentLevel >= building.levels.length) return `已达到最高等级 (${currentLevel}级)`
  return `当前等级: ${currentLevel}级`
}

// 获取建筑下一级所需资源文本
const getNextLevelCostText = (building) => {
  const currentLevel = getBuildingLevel(building.id)
  if (currentLevel >= building.levels.length) return '已达到最高等级'
  const nextLevel = building.levels[currentLevel]
  return Object.entries(nextLevel.cost).map(([resource, amount]) => `${gameStore.getResourceName(resource)}: ${amount}`).join(', ')
}

// 获取建筑效果文本
const getBuildingEffectsText = (building) => {
  const currentLevel = getBuildingLevel(building.id)
  if (currentLevel === 0) {
    // 显示第一级效果
    const firstLevel = building.levels[0]
    return Object.entries(firstLevel.effects).map(([effect, value]) => formatEffectText(effect, value)).join(', ')
  }
  // 显示当前等级效果
  const existingBuilding = gameStore.buildings.find(b => b.id === building.id)
  return Object.entries(existingBuilding.effects).map(([effect, value]) => formatEffectText(effect, value)).join(', ')
}

// 格式化效果文本
const formatEffectText = (effect, value) => {
  const effectTexts = {
    energyRecovery: `体力恢复 +${value}/小时`,
    maxHealth: `健康上限 +${value}`,
    storageMultiplier: `存储上限 x${value}`,
    craftingEfficiency: `制作效率 x${value}`,
    foodPerDay: `食物 +${value}/天`,
    waterPerDay: `水 +${value}/天`,
    herbPerDay: `草药 +${value}/天`,
    medicinePerDay: `药品 +${value}/天`,
    toolsPerDay: `工具 +${value}/天`,
    partsPerDay: `零件 +${value}/天`,
    fuelPerDay: `燃料 +${value}/天`,
    metalPerDay: `金属 +${value}/天`,
    stonePerDay: `石头 +${value}/天`,
    woodPerDay: `木材 +${value}/天`
  }
  return effectTexts[effect] || `${effect}: ${value}`
}
</script>

<template>
  <div class="building-panel">
    <h3>建筑</h3>
    <div class="buildings-list">
      <el-collapse>
        <el-collapse-item v-for="building in buildings" :key="building.id">
          <template #title>
            <div class="building-header">
              <span class="building-name">{{ building.name }}</span>
              <span class="building-status" :class="{
                'not-built': getBuildingLevel(building.id) === 0,
                'max-level': getBuildingLevel(building.id) >= building.levels.length
              }">
                {{ getBuildingStatusText(building) }}
              </span>
            </div>
          </template>
          <div class="building-details">
            <p class="building-description">{{ building.description }}</p>
            <el-descriptions border :column="1">
              <el-descriptions-item label="效果">{{ getBuildingEffectsText(building) }}</el-descriptions-item>
              <template v-if="getBuildingLevel(building.id) < building.levels.length">
                <el-descriptions-item label="所需资源">{{ getNextLevelCostText(building) }}</el-descriptions-item>
                <el-descriptions-item label="技能要求">
                  {{Object.entries(building.levels[getBuildingLevel(building.id)].requirements)
                    .map(([skill, level]) => `${gameStore.getResourceName(skill)} Lv.${level}`)
                    .join(', ')}}
                </el-descriptions-item>
              </template>
            </el-descriptions>
            <el-button type="primary" style="width: 100%;" :disabled="!canBuildOrUpgrade(building)"
              @click="buildOrUpgrade(building)" class="build-button">
              {{ getBuildingLevel(building.id) === 0 ? '建造' : '升级' }}
            </el-button>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<style scoped>
.building-panel {
  background-color: var(--el-bg-color-overlay);
  border-radius: 4px;
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.building-panel h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.buildings-list {
  flex: 1;
}

.building-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.building-name {
  font-weight: bold;
}

.building-status {
  font-size: 0.9em;
}

.not-built {
  color: var(--el-color-danger);
}

.max-level {
  color: var(--el-color-success);
}

.building-description {
  color: var(--el-text-color-secondary);
  margin-bottom: 15px;
}

.building-details h4 {
  margin: 10px 0 5px 0;
  font-size: 0.9em;
  color: var(--el-text-color-primary);
}

.building-details p {
  margin: 5px 0;
  font-size: 0.9em;
}

.build-button {
  margin-top: 15px;
}
</style>