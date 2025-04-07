<script setup>
import { ref, computed, watch } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { ElNotification } from 'element-plus'
import { technologies } from '../plugins/recipes'

const gameStore = useGameStore()

// 成就列表
const achievements = [
  {
    id: 'first_day',
    name: '新的开始',
    description: '在这个世界生存了一天',
    icon: '🌅',
    condition: (store) => store.player.days >= 1,
    reward: { exp: 10 },
    unlocked: false
  },
  {
    id: 'week_survivor',
    name: '一周生存者',
    description: '在这个世界生存了7天',
    icon: '📅',
    condition: (store) => store.player.days >= 7,
    reward: { exp: 30 },
    unlocked: false
  },
  {
    id: 'month_survivor',
    name: '月度生存者',
    description: '在这个世界生存了30天',
    icon: '🗓️',
    condition: (store) => store.player.days >= 30,
    reward: { exp: 100 },
    unlocked: false
  },
  {
    id: 'season_cycle',
    name: '四季轮回',
    description: '经历了一个完整的四季循环',
    icon: '🔄',
    condition: (store) => store.player.days >= 120,
    reward: { exp: 200 },
    unlocked: false
  },
  {
    id: 'resource_collector',
    name: '资源收集者',
    description: '累计收集超过100单位的基础资源',
    icon: '📦',
    condition: (store) => {
      const basicResources = ['food', 'water', 'wood', 'stone']
      return basicResources.reduce((sum, res) => sum + store.resources[res], 0) >= 100
    },
    reward: { exp: 50 },
    unlocked: false
  },
  {
    id: 'resource_collector-2',
    name: '资源收集者-2',
    description: '累计收集超过500单位的基础资源',
    icon: '📦',
    condition: (store) => {
      const basicResources = ['food', 'water', 'wood', 'stone']
      return basicResources.reduce((sum, res) => sum + store.resources[res], 0) >= 500
    },
    reward: { exp: 50 },
    unlocked: false
  },
  {
    id: 'resource_collector-3',
    name: '资源收集者-3',
    description: '累计收集超过1000单位的基础资源',
    icon: '📦',
    condition: (store) => {
      const basicResources = ['food', 'water', 'wood', 'stone']
      return basicResources.reduce((sum, res) => sum + store.resources[res], 0) >= 1000
    },
    reward: { exp: 50 },
    unlocked: false
  },
  {
    id: 'master_gatherer',
    name: '采集大师',
    description: '采集技能达到5级',
    icon: '🧺',
    condition: (store) => store.skills.gathering >= 5,
    reward: { exp: 80 },
    unlocked: false
  },
  {
    id: 'master_gatherer-2',
    name: '采集大师-2',
    description: '采集技能达到20级',
    icon: '🧺',
    condition: (store) => store.skills.gathering >= 20,
    reward: { exp: 80 },
    unlocked: false
  },
  {
    id: 'master_gatherer-3',
    name: '采集大师-3',
    description: '采集技能达到50级',
    icon: '🧺',
    condition: (store) => store.skills.gathering >= 50,
    reward: { exp: 80 },
    unlocked: false
  },
  {
    id: 'master_crafter',
    name: '制作大师',
    description: '制作技能达到5级',
    icon: '🔨',
    condition: (store) => store.skills.crafting >= 5,
    reward: { exp: 80 },
    unlocked: false
  },
  {
    id: 'master_crafter-2',
    name: '制作大师-2',
    description: '制作技能达到20级',
    icon: '🔨',
    condition: (store) => store.skills.crafting >= 20,
    reward: { exp: 80 },
    unlocked: false
  },
  {
    id: 'master_crafter-3',
    name: '制作大师-3',
    description: '制作技能达到50级',
    icon: '🔨',
    condition: (store) => store.skills.crafting >= 50,
    reward: { exp: 80 },
    unlocked: false
  },
  {
    id: 'master_survivor',
    name: '生存大师',
    description: '生存技能达到5级',
    icon: '🏕️',
    condition: (store) => store.skills.survival >= 5,
    reward: { exp: 80 },
    unlocked: false
  },
  {
    id: 'master_survivor-2',
    name: '生存大师-2',
    description: '生存技能达到20级',
    icon: '🏕️',
    condition: (store) => store.skills.survival >= 20,
    reward: { exp: 80 },
    unlocked: false
  },
  {
    id: 'master_survivor-3',
    name: '生存大师-3',
    description: '生存技能达到50级',
    icon: '🏕️',
    condition: (store) => store.skills.survival >= 50,
    reward: { exp: 80 },
    unlocked: false
  },
  {
    id: 'master_researcher',
    name: '研究大师',
    description: '研究技能达到5级',
    icon: '🔬',
    condition: (store) => store.skills.research >= 5,
    reward: { exp: 80 },
    unlocked: false
  },
  {
    id: 'master_researcher-2',
    name: '研究大师-2',
    description: '研究技能达到20级',
    icon: '🔬',
    condition: (store) => store.skills.research >= 20,
    reward: { exp: 80 },
    unlocked: false
  },
  {
    id: 'master_researcher-3',
    name: '研究大师-3',
    description: '研究技能达到50级',
    icon: '🔬',
    condition: (store) => store.skills.research >= 50,
    reward: { exp: 80 },
    unlocked: false
  },
  {
    id: 'tech_enthusiast',
    name: '科技爱好者',
    description: '解锁10项科技',
    icon: '💡',
    condition: (store) => store.researched.length >= 10,
    reward: { exp: 100 },
    unlocked: false
  },
  {
    id: 'builder',
    name: '建设者',
    description: '建造3座建筑',
    icon: '🏗️',
    condition: (store) => store.buildings.length >= 3,
    reward: { exp: 70 },
    unlocked: false
  },
  {
    id: 'explorer',
    name: '探险家',
    description: '完成100次探索活动',
    icon: '🧭',
    condition: (store) => store.player.explorationCount >= 100,
    reward: { exp: 90 },
    unlocked: false
  },
  {
    id: 'explorer-2',
    name: '探险家-2',
    description: '完成500次探索活动',
    icon: '🧭',
    condition: (store) => store.player.explorationCount >= 500,
    reward: { exp: 90 },
    unlocked: false
  },
  {
    id: 'explorer-3',
    name: '探险家-3',
    description: '完成1000次探索活动',
    icon: '🧭',
    condition: (store) => store.player.explorationCount >= 1000,
    reward: { exp: 90 },
    unlocked: false
  },
  {
    id: 'relic_hunter',
    name: '遗物猎人',
    description: '收集3个古代遗物',
    icon: '🏺',
    condition: (store) => store.resources.ancientRelic >= 3,
    reward: { exp: 120 },
    unlocked: false
  },
  {
    id: 'weather_survivor',
    name: '气象生存者',
    description: '在极端天气中生存',
    icon: '⛈️',
    condition: (store) => store.achievements.extremeWeatherSurvived,
    reward: { exp: 60 },
    unlocked: false
  },
  {
    id: 'healthy_survivor',
    name: '健康生存者-1',
    description: '保持健康在90%以上连续7天',
    icon: '❤️',
    condition: (store) => store.achievements.healthyDays >= 7,
    reward: { exp: 70 },
    unlocked: false
  },
  {
    id: 'healthy_survivor_2',
    name: '健康生存者-2',
    description: '保持健康在90%以上连续30天',
    icon: '❤️',
    condition: (store) => store.achievements.healthyDays >= 30,
    reward: { exp: 70 },
    unlocked: false
  },
  {
    id: 'healthy_survivor_3',
    name: '健康生存者-3',
    description: '四季循环中持续保持健康在90%以上',
    icon: '❤️',
    condition: (store) => store.achievements.healthyDays >= 120,
    reward: { exp: 70 },
    unlocked: false
  }
]

// 本地成就状态
const localAchievements = ref(achievements)

// 已解锁的成就
const unlockedAchievements = computed(() => {
  return localAchievements.value.filter(a => gameStore.achievements.unlocked.includes(a.id))
})

// 未解锁的成就
const lockedAchievements = computed(() => {
  return localAchievements.value.filter(a => !gameStore.achievements.unlocked.includes(a.id))
})

// 成就完成百分比
const achievementProgress = computed(() => {
  return Math.round((unlockedAchievements.value.length / localAchievements.value.length) * 100)
})

// 检查成就是否达成
const checkAchievements = () => {
  localAchievements.value.forEach(achievement => {
    if (!achievement.unlocked && achievement.condition(gameStore)) unlockAchievement(achievement)
  })
}

// 解锁成就
const unlockAchievement = (achievement) => {
  if (gameStore.achievements.unlocked.includes(achievement.id)) return
  // 标记为已解锁
  achievement.unlocked = true
  // 添加到游戏存档中
  gameStore.achievements.unlocked.push(achievement.id)
  // 发放奖励
  if (!achievement.reward) return
  if (!achievement.reward.exp) return
  // 增加经验值
  gameStore.player.exp += achievement.reward.exp
  // 检查是否升级
  if (gameStore.player.exp >= gameStore.player.expToNextLevel) {
    gameStore.player.exp -= gameStore.player.expToNextLevel
    gameStore.player.level += 1
    gameStore.player.expToNextLevel = Math.floor(gameStore.player.expToNextLevel * 1.5)
    gameStore.addToEventLog(`幸存者增加了！当前幸存者: ${gameStore.player.level}人`)
  }
  // 可以添加其他类型的奖励

  // 记录到事件日志
  gameStore.addToEventLog(`成就解锁: ${achievement.name}`)
  // 显示通知
  ElNotification({
    title: '成就解锁',
    message: `${achievement.icon} ${achievement.name}\n${achievement.description}`,
    type: 'success',
    duration: 4500
  })
}

// 监听游戏状态变化，检查成就
watch(
  () => [gameStore.player.days, gameStore.resources, gameStore.skills, gameStore.buildings, technologies],
  () => checkAchievements(),
  { deep: true }
)

// 初始化成就系统
const initAchievements = () => {
  // 从游戏存档中恢复已解锁的成就
  gameStore.achievements.unlocked.forEach(achievementId => {
    const achievement = localAchievements.value.find(a => a.id === achievementId)
    if (achievement) achievement.unlocked = true
  })
  // 初始检查一次成就
  checkAchievements()
}

// 组件挂载时初始化
initAchievements()
</script>

<template>
  <div class="achievement-system">
    <div class="achievement-header">
      <h3>成就系统</h3>
      <el-progress :percentage="achievementProgress"
        :format="() => `${unlockedAchievements.length}/${localAchievements.length}`" :stroke-width="10" />
    </div>
    <el-tabs type="border-card" class="achievement-tabs">
      <el-tab-pane label="已解锁">
        <div class="achievement-list" v-if="unlockedAchievements.length > 0">
          <div v-for="achievement in unlockedAchievements" :key="achievement.id" class="achievement-item unlocked">
            <div class="achievement-icon">{{ achievement.icon }}</div>
            <div class="achievement-content">
              <div class="achievement-name">{{ achievement.name }}</div>
              <div class="achievement-description">{{ achievement.description }}</div>
              <div class="achievement-reward" v-if="achievement.reward">
                奖励: <span v-if="achievement.reward.exp">+{{ achievement.reward.exp }} 经验</span>
              </div>
            </div>
          </div>
        </div>
        <div class="empty-message" v-else>还没有解锁任何成就</div>
      </el-tab-pane>
      <el-tab-pane label="未解锁">
        <div class="achievement-list" v-if="lockedAchievements.length > 0">
          <div v-for="achievement in lockedAchievements" :key="achievement.id" class="achievement-item locked">
            <div class="achievement-icon">?</div>
            <div class="achievement-content">
              <div class="achievement-name">{{ achievement.name }}</div>
              <div class="achievement-description">{{ achievement.description }}</div>
              <div class="achievement-reward" v-if="achievement.reward">
                奖励: <span v-if="achievement.reward.exp">+{{ achievement.reward.exp }} 经验</span>
              </div>
            </div>
          </div>
        </div>
        <div class="empty-message" v-else>你已解锁所有成就！</div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.achievement-system {
  margin-top: 15px;
  background-color: var(--el-bg-color-overlay);
  border-radius: 4px;
  padding: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.achievement-header {
  margin-bottom: 15px;
}

.achievement-header h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.achievement-tabs {
  height: 300px;
  overflow-y: auto;
}

.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.achievement-item {
  display: flex;
  padding: 10px;
  border-radius: 4px;
  transition: all 0.3s;
}

.achievement-item.unlocked {
  background-color: rgba(103, 194, 58, 0.1);
  border-left: 4px solid var(--el-color-success);
}

.achievement-item.locked {
  background-color: var(--el-fill-color-light);
  border-left: 4px solid var(--el-color-info);
  opacity: 0.8;
}

.achievement-icon {
  font-size: 1.8rem;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--el-fill-color);
  border-radius: 50%;
}

.achievement-content {
  flex: 1;
}

.achievement-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.achievement-description {
  font-size: 0.9rem;
  color: var(--el-text-color-secondary);
  margin-bottom: 5px;
}

.achievement-reward {
  font-size: 0.85rem;
  color: var(--el-color-warning);
}

.empty-message {
  text-align: center;
  padding: 20px;
  color: var(--el-text-color-secondary);
  font-style: italic;
}
</style>