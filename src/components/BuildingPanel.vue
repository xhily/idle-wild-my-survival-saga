<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { ElMessage } from 'element-plus'

const gameStore = useGameStore()

// 建筑列表
const availableBuildings = computed(() => {
  return [
    {
      id: 'shelter',
      name: '简易庇护所',
      description: '提供基本的居住场所，增加体力恢复速度',
      levels: [
        {
          level: 1,
          cost: { wood: 10, stone: 5 },
          effects: { energyRecovery: 1 },
          requirements: { survival: 1 }
        },
        {
          level: 2,
          cost: { wood: 20, stone: 15, metal: 5 },
          effects: { energyRecovery: 2, mentalRecovery: 1 },
          requirements: { survival: 2, crafting: 1 }
        },
        {
          level: 3,
          cost: { wood: 40, stone: 30, metal: 15, tools: 2 },
          effects: { energyRecovery: 3, mentalRecovery: 2, maxHealth: 10 },
          requirements: { survival: 3, crafting: 2 }
        }
      ]
    },
    {
      id: 'storage',
      name: '储物区',
      description: '增加资源存储上限',
      levels: [
        {
          level: 1,
          cost: { wood: 15, stone: 5 },
          effects: { storageMultiplier: 1.2 },
          requirements: { gathering: 1 }
        },
        {
          level: 2,
          cost: { wood: 30, stone: 15, metal: 5 },
          effects: { storageMultiplier: 1.5 },
          requirements: { gathering: 2, crafting: 1 }
        },
        {
          level: 3,
          cost: { wood: 50, stone: 30, metal: 15, tools: 3 },
          effects: { storageMultiplier: 2 },
          requirements: { gathering: 3, crafting: 2 }
        }
      ]
    },
    {
      id: 'workshop',
      name: '工作坊',
      description: '提高制作效率，解锁更多制作配方',
      levels: [
        {
          level: 1,
          cost: { wood: 20, stone: 10, metal: 5 },
          effects: { craftingEfficiency: 1.1 },
          requirements: { crafting: 1 }
        },
        {
          level: 2,
          cost: { wood: 35, stone: 20, metal: 15, tools: 2 },
          effects: { craftingEfficiency: 1.25 },
          requirements: { crafting: 2 }
        },
        {
          level: 3,
          cost: { wood: 60, stone: 40, metal: 30, tools: 5, parts: 3 },
          effects: { craftingEfficiency: 1.5 },
          requirements: { crafting: 3, research: 1 }
        }
      ]
    },
    {
      id: 'garden',
      name: '菜园',
      description: '提供稳定的食物来源',
      levels: [
        {
          level: 1,
          cost: { wood: 10, stone: 5, water: 10 },
          effects: { foodPerDay: 3 },
          requirements: { gathering: 2 }
        },
        {
          level: 2,
          cost: { wood: 20, stone: 10, water: 20, tools: 1 },
          effects: { foodPerDay: 6 },
          requirements: { gathering: 3 }
        },
        {
          level: 3,
          cost: { wood: 40, stone: 20, water: 30, tools: 3, herb: 10 },
          effects: { foodPerDay: 10 },
          requirements: { gathering: 4, research: 1 }
        }
      ]
    },
    {
      id: 'well',
      name: '水井',
      description: '提供稳定的水源',
      levels: [
        {
          level: 1,
          cost: { wood: 5, stone: 15 },
          effects: { waterPerDay: 3 },
          requirements: { gathering: 1, survival: 1 }
        },
        {
          level: 2,
          cost: { wood: 10, stone: 30, metal: 5, tools: 1 },
          effects: { waterPerDay: 6 },
          requirements: { gathering: 2, survival: 2 }
        },
        {
          level: 3,
          cost: { wood: 20, stone: 50, metal: 15, tools: 3 },
          effects: { waterPerDay: 10 },
          requirements: { gathering: 3, survival: 3 }
        }
      ]
    },
    {
      id: 'library',
      name: '图书馆',
      description: '提高研究效率，增加精神恢复',
      levels: [
        {
          level: 1,
          cost: { wood: 25, stone: 10, metal: 5 },
          effects: { mentalRecovery: 1 },
          requirements: { research: 1 }
        },
        {
          level: 2,
          cost: { wood: 50, stone: 25, metal: 15, tools: 2 },
          effects: { mentalRecovery: 2 },
          requirements: { research: 2 }
        },
        {
          level: 3,
          cost: { wood: 80, stone: 50, metal: 30, tools: 5, parts: 3 },
          effects: { mentalRecovery: 3 },
          requirements: { research: 3, crafting: 1 }
        }
      ]
    },
    {
      id: 'barracks',
      name: '兵营',
      description: '提高战斗技能，增加健康值上限',
      levels: [
        {
          level: 1,
          cost: { wood: 30, stone: 20, metal: 10 },
          effects: { maxHealth: 10 },
          requirements: { combat: 1 }
        },
        {
          level: 2,
          cost: { wood: 60, stone: 40, metal: 25, tools: 3 },
          effects: { maxHealth: 20 },
          requirements: { combat: 2 }
        },
        {
          level: 3,
          cost: { wood: 100, stone: 70, metal: 50, tools: 5, parts: 4 },
          effects: { maxHealth: 30 },
          requirements: { combat: 3, survival: 1 }
        }
      ]
    }
  ].filter(building => canSeeBuilding(building))
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
  // 如果已经是最高级，则不能再升级
  if (currentLevel >= building.levels.length) {
    ElMessage.warning(`${building.name}已经达到最高等级`)
    return
  }
  // 获取下一级所需资源和技能
  const nextLevel = building.levels[currentLevel]
  // 检查技能要求
  for (const [skill, level] of Object.entries(nextLevel.requirements)) {
    if (gameStore.skills[skill] < level) {
      ElMessage.warning(`需要${skill}技能达到${level}级`)
      return
    }
  }
  // 检查并消耗资源
  for (const [resource, amount] of Object.entries(nextLevel.cost)) {
    if (gameStore.resources[resource] < amount) {
      ElMessage.warning(`资源不足: 需要${amount}${resource}`)
      return
    }
  }
  // 消耗资源
  for (const [resource, amount] of Object.entries(nextLevel.cost)) {
    gameStore.consumeResource(resource, amount)
  }
  // 更新或添加建筑
  if (currentLevel === 0) {
    // 新建建筑
    gameStore.buildings.push({
      id: building.id,
      name: building.name,
      level: 1,
      effects: nextLevel.effects
    })
    gameStore.addToEventLog(`建造了${building.name}`)
    ElMessage.success(`成功建造了${building.name}`)
  } else {
    // 升级建筑
    const existingBuilding = gameStore.buildings.find(b => b.id === building.id)
    existingBuilding.level += 1
    existingBuilding.effects = nextLevel.effects
    gameStore.addToEventLog(`将${building.name}升级到${existingBuilding.level}级`)
    ElMessage.success(`成功将${building.name}升级到${existingBuilding.level}级`)
  }
  // 应用建筑效果
  gameStore.applyBuildingEffects()
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
  return Object.entries(nextLevel.cost)
    .map(([resource, amount]) => `${gameStore.getResourceName(resource)}: ${amount}`)
    .join(', ')
}

// 获取建筑效果文本
const getBuildingEffectsText = (building) => {
  const currentLevel = getBuildingLevel(building.id)
  if (currentLevel === 0) {
    // 显示第一级效果
    const firstLevel = building.levels[0]
    return Object.entries(firstLevel.effects)
      .map(([effect, value]) => formatEffectText(effect, value))
      .join(', ')
  }
  // 显示当前等级效果
  const existingBuilding = gameStore.buildings.find(b => b.id === building.id)
  return Object.entries(existingBuilding.effects)
    .map(([effect, value]) => formatEffectText(effect, value))
    .join(', ')
}

// 格式化效果文本
const formatEffectText = (effect, value) => {
  const effectTexts = {
    energyRecovery: `体力恢复 +${value}/小时`,
    mentalRecovery: `精神恢复 +${value}/小时`,
    maxHealth: `健康值上限 +${value}`,
    storageMultiplier: `存储上限 x${value}`,
    craftingEfficiency: `制作效率 x${value}`,
    foodPerDay: `食物 +${value}/天`,
    waterPerDay: `水 +${value}/天`
  }
  return effectTexts[effect] || `${effect}: ${value}`
}
</script>

<template>
  <div class="building-panel">
    <h3>建筑</h3>
    <div class="buildings-list">
      <el-collapse>
        <el-collapse-item v-for="building in availableBuildings" :key="building.id">
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
                    .join(', ') }}
                </el-descriptions-item>
              </template>
            </el-descriptions>
            <el-button type="primary" style="width: 100%;" :disabled="!canBuildOrUpgrade(building)" @click="buildOrUpgrade(building)"
              class="build-button">
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