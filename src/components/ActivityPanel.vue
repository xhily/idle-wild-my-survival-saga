<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { ElMessage } from 'element-plus'
import { recipes } from '../plugins/recipes'

const gameStore = useGameStore()

// 活动更新定时器
const activityTimerId = ref(null)

// 活动类型标签
const activityTabs = ref('gathering')

// 按类型分组的活动
const gatheringActivities = computed(() => {
  return recipes.filter(recipe =>
    recipe.id.startsWith('gather_') &&
    meetsSkillRequirements(recipe)
  )
})

const craftingActivities = computed(() => {
  return recipes.filter(recipe =>
    recipe.id.startsWith('craft_') &&
    meetsSkillRequirements(recipe)
  )
})

const explorationActivities = computed(() => {
  return recipes.filter(recipe =>
    recipe.id.startsWith('explore_') &&
    meetsSkillRequirements(recipe)
  )
})

// 检查是否满足技能要求
const meetsSkillRequirements = (recipe) => {
  if (!recipe.skillRequired) return true
  for (const [skill, level] of Object.entries(recipe.skillRequired)) {
    if (gameStore.skills[skill] < level) return false
  }
  return true
}

// 检查是否有足够的资源
const hasEnoughResources = (recipe) => {
  if (!recipe.inputs) return true
  for (const [resource, amount] of Object.entries(recipe.inputs)) {
    if (resource === 'energy') if (gameStore.player.energy < amount) return false
    else if (gameStore.resources[resource] < amount) return false
  }
  return true
}

// 开始活动
const startActivity = (recipeId) => {
  const success = gameStore.startActivity(recipeId)
  if (success) ElMessage.success('活动已开始')
}

// 计算活动时间文本
const getActivityDuration = (seconds) => {
  if (seconds < 60) return `${seconds}秒`
  return `${Math.floor(seconds / 60)}分${seconds % 60}秒`
}

// 获取资源输入文本
const getInputText = (inputs) => {
  if (!inputs) return '无消耗'
  return Object.entries(inputs).map(([resource, amount]) => {
    if (resource === 'energy') return `体力x${amount}`
    return `${gameStore.getResourceName(resource)}x${amount}`
  }).join(', ')
}

// 获取资源输出文本
const getOutputText = (outputs) => {
  if (!outputs) return '无产出'
  return Object.entries(outputs).map(([resource, range]) => {
    if (Array.isArray(range)) return `${gameStore.getResourceName(resource)} ${range[0]}~${range[1]}`
    return `${gameStore.getResourceName(resource)}x${range}`
  }).join(', ')
}

// 获取技能要求文本
const getSkillRequirementText = (skillRequired) => {
  if (!skillRequired) return '无要求'
  const skillNames = {
    gathering: '采集',
    crafting: '制作',
    combat: '战斗',
    survival: '生存',
    research: '研究'
  }
  return Object.entries(skillRequired).map(([skill, level]) => {
    return `${skillNames[skill] || skill} Lv.${level}`
  }).join(', ')
}

// 获取技能效果加成文本
const getSkillEffectText = (recipe) => {
  const effects = []
  const category = recipe.category
  if (category === 'gathering') {
    // 采集效率加成
    if (gameStore.skillTreeEffects.gatheringEfficiency > 0) effects.push(`采集效率 +${Math.round(gameStore.skillTreeEffects.gatheringEfficiency * 100)}%`)
    // 采集产出加成
    if (gameStore.skillTreeEffects.gatheringYield > 0) effects.push(`产出增加 +${Math.round(gameStore.skillTreeEffects.gatheringYield * 100)}%`)
    // 体力消耗减少
    if (gameStore.skillTreeEffects.gatheringEnergyCost < 0) effects.push(`体力消耗 ${Math.round(gameStore.skillTreeEffects.gatheringEnergyCost * 100)}%`)
    // 稀有资源几率
    if (recipe.id.includes('herb') && gameStore.skillTreeEffects.rareHerbChance > 0) effects.push(`稀有草药几率 +${Math.round(gameStore.skillTreeEffects.rareHerbChance * 100)}%`)
  } else if (category === 'crafting') {
    // 制作速度加成
    if (gameStore.skillTreeEffects.craftingSpeed > 0) effects.push(`制作速度 +${Math.round(gameStore.skillTreeEffects.craftingSpeed * 100)}%`)
    // 资源节约几率
    if (gameStore.skillTreeEffects.resourceSaving > 0) effects.push(`资源节约几率 +${Math.round(gameStore.skillTreeEffects.resourceSaving * 100)}%`)
    // 额外产出几率
    if (gameStore.skillTreeEffects.extraCraftingOutput > 0) effects.push(`额外产出几率 +${Math.round(gameStore.skillTreeEffects.extraCraftingOutput * 100)}%`)
    // 工具耐久度
    if (recipe.id.includes('tool') && gameStore.skillTreeEffects.toolDurability > 0) effects.push(`工具耐久度 +${Math.round(gameStore.skillTreeEffects.toolDurability * 100)}%`)
  } else if (category === 'research') {
    // 研究速度加成
    if (gameStore.skillTreeEffects.researchSpeed > 0) effects.push(`研究速度 +${Math.round(gameStore.skillTreeEffects.researchSpeed * 100)}%`)
    // 科技碎片产出
    if (gameStore.skillTreeEffects.techFragmentYield > 0) effects.push(`科技碎片产出 +${Math.round(gameStore.skillTreeEffects.techFragmentYield * 100)}%`)
    // 突破性发现几率
    if (gameStore.skillTreeEffects.breakthroughChance > 0) effects.push(`突破性发现几率 +${Math.round(gameStore.skillTreeEffects.breakthroughChance * 100)}%`)
  }
  // 通用体力消耗减少
  if (gameStore.skillTreeEffects.energyConsumption < 0 && !effects.some(e => e.includes('体力消耗'))) effects.push(`体力消耗 ${Math.round(gameStore.skillTreeEffects.energyConsumption * 100)}%`)
  return effects.length > 0 ? effects.join('，') : '无加成效果'
}

// 活动进度和时间的响应式数据
const activityProgress = ref({})
const activityRemainingTime = ref({})

// 更新所有进行中活动的进度和时间
const updateActivitiesStatus = () => {
  gameStore.currentActivities.forEach(activity => {
    const now = Date.now()
    const elapsed = now - activity.startTime
    const progress = Math.min(100, (elapsed / activity.duration) * 100)
    activityProgress.value[activity.id] = progress
    const remaining = Math.max(0, activity.duration - elapsed)
    const seconds = Math.ceil(remaining / 1000)
    activityRemainingTime.value[activity.id] = seconds < 60 ? `${seconds}秒` : `${Math.floor(seconds / 60)}分${seconds % 60}秒`
  })
}

// 计算进行中的活动完成百分比
const getActivityProgress = (activity) => {
  if (activityProgress.value[activity.id] !== undefined) return activityProgress.value[activity.id]
  // 初始计算
  const now = Date.now()
  const elapsed = now - activity.startTime
  const progress = Math.min(100, (elapsed / activity.duration) * 100)
  return progress
}

// 计算活动剩余时间
const getActivityRemainingTime = (activity) => {
  if (activityRemainingTime.value[activity.id] !== undefined) return activityRemainingTime.value[activity.id]
  // 初始计算
  const now = Date.now()
  const elapsed = now - activity.startTime
  const remaining = Math.max(0, activity.duration - elapsed)
  const seconds = Math.ceil(remaining / 1000)
  if (seconds < 60) return `${seconds}秒`
  return `${Math.floor(seconds / 60)}分${seconds % 60}秒`
}

// 启动活动状态更新定时器
const startActivityTimer = () => {
  if (activityTimerId.value) return
  // 每秒更新一次活动状态
  activityTimerId.value = setInterval(() => {
    if (gameStore.gameState === 'playing' && gameStore.currentActivities.length > 0) updateActivitiesStatus()
  }, 1000)
}

// 组件挂载时启动定时器
onMounted(() => startActivityTimer())

// 组件卸载时清除定时器
onUnmounted(() => {
  if (activityTimerId.value) {
    clearInterval(activityTimerId.value)
    activityTimerId.value = null
  }
})

const pendingActivities = computed(() => gameStore.pendingActivities)
</script>
<template>
  <el-scrollbar class="activity-panel">
    <div class="current-activities" v-if="gameStore.currentActivities.length > 0 || pendingActivities.length > 0">
      <h4>活动队列</h4>
      <div class="activity-list">
        <!-- 当前活动 -->
        <div v-for="activity in gameStore.currentActivities" :key="activity.id" class="activity-card in-progress">
          <div class="activity-header">
            <div class="activity-name">{{ activity.name }}</div>
            <div class="activity-time">剩余: {{ getActivityRemainingTime(activity) }}</div>
          </div>
          <el-progress :percentage="getActivityProgress(activity)" :stroke-width="10" :show-text="false" />
          <div class="activity-actions">
            <el-button style="width: 100%;margin-top: 5px;" type="danger" size="small"
              @click="gameStore.cancelActivity(activity.id)" :disabled="gameStore.gameState !== 'playing'">
              取消
            </el-button>
          </div>
        </div>
        
        <!-- 等待中的活动 -->
        <div v-for="activity in pendingActivities" :key="activity.id" class="activity-card pending">
          <div class="activity-header">
            <div class="activity-name">{{ activity.name }}</div>
            <div class="activity-time">等待中</div>
          </div>
          <el-progress :percentage="0" :stroke-width="10" :show-text="false" status="warning" />
          <div class="activity-actions">
            <el-button style="width: 100%;margin-top: 5px;" type="danger" size="small"
              @click="gameStore.cancelActivity(activity.id)" :disabled="gameStore.gameState !== 'playing'">
              取消
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <div class="available-activities">
      <h4>可用活动</h4>
      <el-tabs v-model="activityTabs">
        <el-tab-pane label="采集" name="gathering">
          <div class="activity-list">
            <div v-for="recipe in gatheringActivities" :key="recipe.id" class="activity-card">
              <div class="activity-header">
                <div class="activity-name">{{ recipe.name }}</div>
                <div class="activity-time">{{ getActivityDuration(recipe.duration) }}</div>
              </div>
              <div class="activity-details">
                <div class="activity-resources">
                  <div class="activity-inputs">消耗: {{ getInputText(recipe.inputs) }}</div>
                  <div class="activity-outputs">产出: {{ getOutputText(recipe.outputs) }}</div>
                </div>
                <div class="activity-requirements">
                  需求: {{ getSkillRequirementText(recipe.skillRequired) }}
                </div>
                <div class="activity-requirements" v-if="getSkillEffectText(recipe) !== '无加成效果'">
                  加成: {{ getSkillEffectText(recipe) }}
                </div>
              </div>
              <div class="activity-actions">
                <el-button type="primary" size="small" @click="startActivity(recipe.id)"
                  :disabled="!hasEnoughResources(recipe) || gameStore.gameState !== 'playing'">
                  {{ hasEnoughResources(recipe) ? '开始' : '资源不足' }}
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="制作" name="crafting">
          <div class="activity-list">
            <div v-for="recipe in craftingActivities" :key="recipe.id" class="activity-card">
              <div class="activity-header">
                <div class="activity-name">{{ recipe.name }}</div>
                <div class="activity-time">{{ getActivityDuration(recipe.duration) }}</div>
              </div>
              <div class="activity-details">
                <div class="activity-resources">
                  <div class="activity-inputs">消耗: {{ getInputText(recipe.inputs) }}</div>
                  <div class="activity-outputs">产出: {{ getOutputText(recipe.outputs) }}</div>
                </div>
                <div class="activity-requirements">
                  需求: {{ getSkillRequirementText(recipe.skillRequired) }}
                </div>
                <div class="activity-requirements" v-if="getSkillEffectText(recipe) !== '无加成效果'">
                  加成: {{ getSkillEffectText(recipe) }}
                </div>
              </div>
              <div class="activity-actions">
                <el-button type="primary" size="small" @click="startActivity(recipe.id)"
                  :disabled="!hasEnoughResources(recipe) || gameStore.gameState !== 'playing'">
                  {{ hasEnoughResources(recipe) ? '开始' : '资源不足' }}
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-scrollbar>
</template>

<style scoped>
/* 添加等待中活动的样式 */
.activity-card.pending {
  border-left: 4px solid #E6A23C;
  opacity: 0.8;
}
.activity-panel {
  background-color: var(--el-bg-color-overlay);
  border-radius: 4px;
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.activity-panel h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.current-activities {
  margin-bottom: 20px;
}

.activity-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin: 10px;
}

.activity-card {
  background-color: var(--el-bg-color);
  border-radius: 4px;
  padding: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.activity-card:hover {
  transform: translateY(-3px);
}

.activity-card.in-progress {
  border-left: 4px solid #409EFF;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.activity-name {
  font-weight: bold;
}

.activity-time {
  font-size: 0.8em;
  color: var(--el-text-color-secondary);
}

.activity-details {
  margin-bottom: 10px;
  font-size: 0.9em;
}

.activity-resources {
  margin-bottom: 5px;
}

.activity-inputs,
.activity-outputs,
.activity-requirements {
  color: var(--el-text-color-secondary);
  margin-bottom: 3px;
}

.activity-actions {
  display: flex;
  justify-content: flex-end;
}

.available-activities {
  flex: 1;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .activity-list {
    grid-template-columns: 1fr;
  }
}
</style>