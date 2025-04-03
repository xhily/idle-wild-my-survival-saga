<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()

// 时间流逝速度选项
const timeScaleOptions = [
  { label: '慢速 (0.5x)', value: 0.5 },
  { label: '正常 (1x)', value: 1 },
  { label: '快速 (2x)', value: 2 },
  { label: '极速 (5x)', value: 5 }
]

// 当前选中的时间流逝速度
const currentTimeScale = computed({
  get: () => gameStore.gameTime.timeScale,
  set: (value) => {
    gameStore.gameTime.timeScale = value
    gameStore.addToEventLog(`时间流速调整为 ${value}x`)
  }
})

// 当前游戏时间的格式化显示
const formattedGameTime = computed(() => {
  const { day, hour, minute } = gameStore.gameTime
  return {
    day,
    time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  }
})

// 获取当前时间段（早晨、白天、傍晚、夜晚）
const dayPeriod = computed(() => {
  const hour = gameStore.gameTime.hour
  if (hour >= 5 && hour < 9) return { name: '早晨', icon: '🌅' }
  if (hour >= 9 && hour < 17) return { name: '白天', icon: '☀️' }
  if (hour >= 17 && hour < 21) return { name: '傍晚', icon: '🌇' }
  return { name: '夜晚', icon: '🌙' }
})

// 获取当前季节（基于天数）
const currentSeason = computed(() => {
  const day = gameStore.gameTime.day
  const seasonLength = 30 // 每个季节30天
  const seasonIndex = Math.floor((day - 1) % (seasonLength * 4) / seasonLength)
  // 计算季节进度（0-100%）
  const seasonProgress = (((day - 1) % seasonLength) / seasonLength) * 100
  const seasons = [
    {
      name: '春季',
      icon: '🌱',
      effect: '植物生长加速，草药和食物采集+20%',
      detailedEffects: [
        '草药生长速度提升50%',
        '食物采集效率+20%',
        '雨天概率增加，有利于植物生长',
        '早晨容易起雾，影响视野'
      ],
      progress: seasonProgress.toFixed(0)
    },
    {
      name: '夏季',
      icon: '☀️',
      effect: '高温增加水分消耗，热浪风险增加',
      detailedEffects: [
        '水分消耗+30%',
        '中午时段酷热概率增加',
        '暴雨可能引发洪水风险',
        '风暴概率增加，带来资源损失风险'
      ],
      progress: seasonProgress.toFixed(0)
    },
    {
      name: '秋季',
      icon: '🍂',
      effect: '收获季节，食物产量+30%',
      detailedEffects: [
        '食物采集产量+30%',
        '傍晚大风概率增加，可能带来额外资源',
        '雾天更加浓重，探索效率降低',
        '温度逐渐降低，体力消耗略微增加'
      ],
      progress: seasonProgress.toFixed(0)
    },
    {
      name: '冬季',
      icon: '❄️',
      effect: '寒冷增加食物消耗，降雪减缓移动速度',
      detailedEffects: [
        '食物消耗+50%',
        '移动速度-30%（雪天）',
        '夜间寒冷概率大幅增加',
        '风暴和暴风雪风险增加，可能损坏建筑'
      ],
      progress: seasonProgress.toFixed(0)
    }
  ]
  // 检测季节变化
  const previousDay = day - 1
  const previousSeasonIndex = Math.floor((previousDay - 1) % (seasonLength * 4) / seasonLength)
  // 如果季节发生变化，添加事件日志
  if (seasonIndex !== previousSeasonIndex && day > 1) {
    const newSeason = seasons[seasonIndex]
    gameStore.addToEventLog(`季节变化：${newSeason.name}已经到来，${newSeason.effect}`)
    // 季节变化特殊事件
    if (seasonIndex === 0) { // 春季开始
      gameStore.addToEventLog('春回大地，植物开始萌发，草药更容易找到了')
    } else if (seasonIndex === 1) { // 夏季开始
      gameStore.addToEventLog('炎炎夏日，记得储备足够的水源')
    } else if (seasonIndex === 2) { // 秋季开始
      gameStore.addToEventLog('丰收的季节，食物采集效率提高了')
    } else if (seasonIndex === 3) { // 冬季开始
      gameStore.addToEventLog('寒冬将至，需要更多食物和燃料来度过严冬')
    }
  }
  return seasons[seasonIndex]
})
</script>

<template>
  <div class="time-control">
    <div class="time-display">
      <div class="day-display">
        <span class="day-number">第 {{ formattedGameTime.day }} 天</span>
        <div class="season-info">
          <div class="season-header">
            <span class="season-indicator">{{ currentSeason.icon }} {{ currentSeason.name }}</span>
            <span class="season-progress">{{ currentSeason.progress }}%</span>
          </div>
          <div class="season-progress-bar">
            <div class="progress-fill" :style="{ width: currentSeason.progress + '%' }"></div>
          </div>
          <el-popover placement="bottom" :width="200" trigger="hover" popper-class="season-popover">
            <template #reference>
              <span class="season-effect">{{ currentSeason.effect }}</span>
            </template>
            <template #default>
              <div class="detailed-effects">
                <el-descriptions title="季节效果详情" :column="1" size="small">
                  <el-descriptions-item v-for="(effect, index) in currentSeason.detailedEffects" :key="index"
                    :label="effect"></el-descriptions-item>
                </el-descriptions>
              </div>
            </template>
          </el-popover>
        </div>
      </div>
      <div class="time-of-day">
        <span class="time">{{ formattedGameTime.time }}</span>
        <span class="period-indicator">{{ dayPeriod.icon }} {{ dayPeriod.name }}</span>
      </div>
    </div>
    <div class="time-scale-control">
      <span class="time-scale-label">时间流速:</span>
      <el-select v-model="currentTimeScale" size="small" :disabled="gameStore.gameState !== 'playing'">
        <el-option v-for="option in timeScaleOptions" :key="option.value" :label="option.label" :value="option.value" />
      </el-select>
    </div>
  </div>
</template>

<style scoped>
.time-control {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background-color: var(--el-bg-color);
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
}

.time-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.day-display,
.time-of-day {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.day-number {
  font-weight: bold;
  font-size: 1.1em;
}

.time {
  font-weight: bold;
  font-size: 1.1em;
}

.season-indicator,
.period-indicator {
  font-size: 0.9em;
  color: var(--el-text-color-secondary);
}

.season-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.season-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.season-progress {
  font-size: 0.8em;
  color: var(--el-text-color-secondary);
}

.season-progress-bar {
  height: 4px;
  width: 100%;
  background-color: var(--el-border-color-lighter);
  border-radius: 2px;
  overflow: hidden;
  margin: 2px 0;
}

.progress-fill {
  height: 100%;
  background-color: var(--el-color-primary);
  border-radius: 2px;
}

.season-effect {
  font-size: 0.8em;
  color: var(--el-text-color-secondary);
  font-style: italic;
  cursor: pointer;
  text-decoration: underline dotted;
}

.detailed-effects {
  padding: 5px;
}

.time-scale-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
}

.time-scale-label {
  font-size: 0.9em;
  color: var(--el-text-color-secondary);
}
</style>