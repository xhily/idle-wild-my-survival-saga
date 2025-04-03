<script setup>
import { ref, computed, watch } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()

// 季节配置
const seasons = {
  spring: {
    name: '春季',
    icon: '🌱',
    description: '万物复苏的季节，植物生长旺盛，资源恢复较快',
    color: '#7cb342',
    effects: {
      foodGrowthRate: 1.2,
      herbGrowthRate: 1.3,
      energyConsumption: 0.9,
      waterConsumption: 1.0,
      mentalRecovery: 1.1
    }
  },
  summer: {
    name: '夏季',
    icon: '☀️',
    description: '炎热的季节，水分消耗增加，但阳光充足',
    color: '#f57c00',
    effects: {
      foodGrowthRate: 1.0,
      herbGrowthRate: 0.8,
      energyConsumption: 1.2,
      waterConsumption: 1.3,
      mentalRecovery: 0.9
    }
  },
  autumn: {
    name: '秋季',
    icon: '🍂',
    description: '收获的季节，食物资源丰富，天气多变',
    color: '#8d6e63',
    effects: {
      foodGrowthRate: 1.4,
      herbGrowthRate: 0.7,
      energyConsumption: 1.0,
      waterConsumption: 0.9,
      mentalRecovery: 1.0
    }
  },
  winter: {
    name: '冬季',
    icon: '❄️',
    description: '寒冷的季节，资源稀缺，体力消耗增加',
    color: '#90caf9',
    effects: {
      foodGrowthRate: 0.6,
      herbGrowthRate: 0.4,
      energyConsumption: 1.3,
      waterConsumption: 0.8,
      mentalRecovery: 0.8
    }
  }
}

// 获取当前季节
const currentSeason = computed(() => {
  const day = gameStore.gameTime.day
  const seasonLength = 30 // 每个季节30天
  const seasonIndex = Math.floor((day - 1) % (seasonLength * 4) / seasonLength)
  const seasonKeys = ['spring', 'summer', 'autumn', 'winter']
  return seasons[seasonKeys[seasonIndex]]
})

// 计算当前季节的进度
const seasonProgress = computed(() => {
  const day = gameStore.gameTime.day
  const seasonLength = 30 // 每个季节30天
  return ((day - 1) % seasonLength) / seasonLength * 100
})

// 计算下一个季节
const nextSeason = computed(() => {
  const day = gameStore.gameTime.day
  const seasonLength = 30 // 每个季节30天
  const currentSeasonIndex = Math.floor((day - 1) % (seasonLength * 4) / seasonLength)
  const nextSeasonIndex = (currentSeasonIndex + 1) % 4
  const seasonKeys = ['spring', 'summer', 'autumn', 'winter']
  return seasons[seasonKeys[nextSeasonIndex]]
})

// 计算距离下一个季节的天数
const daysToNextSeason = computed(() => {
  const day = gameStore.gameTime.day
  const seasonLength = 30 // 每个季节30天
  const daysInCurrentSeason = (day - 1) % seasonLength
  return seasonLength - daysInCurrentSeason
})

// 监听季节变化
watch(
  () => Math.floor((gameStore.gameTime.day - 1) / 30) % 4,
  (newSeason, oldSeason) => {
    if (newSeason !== oldSeason) {
      const seasonKeys = ['spring', 'summer', 'autumn', 'winter']
      gameStore.addToEventLog(`季节已变为${seasons[seasonKeys[newSeason]].name}，${seasons[seasonKeys[newSeason]].description}`)
      // 季节变化时可以触发特殊事件
      triggerSeasonChangeEvent(seasonKeys[newSeason])
    }
  }
)

// 季节变化特殊事件
const triggerSeasonChangeEvent = (seasonKey) => {
  switch (seasonKey) {
    case 'spring':
      if (Math.random() < 0.3) {
        const herbAmount = Math.floor(Math.random() * 5) + 3
        gameStore.addResource('herb', herbAmount)
        gameStore.addToEventLog(`春季到来，你发现了${herbAmount}单位新鲜草药`)
      }
      break
    case 'summer':
      if (Math.random() < 0.3) {
        const waterAmount = Math.floor(Math.random() * 5) + 3
        gameStore.addResource('water', waterAmount)
        gameStore.addToEventLog(`夏季雷雨增多，你收集了${waterAmount}单位额外的水`)
      }
      break
    case 'autumn':
      if (Math.random() < 0.3) {
        const foodAmount = Math.floor(Math.random() * 8) + 5
        gameStore.addResource('food', foodAmount)
        gameStore.addToEventLog(`秋季丰收，你获得了${foodAmount}单位额外的食物`)
      }
      break
    case 'winter':
      if (Math.random() < 0.3) {
        const fuelAmount = Math.floor(Math.random() * 3) + 2
        gameStore.addResource('fuel', fuelAmount)
        gameStore.addToEventLog(`冬季来临，你准备了${fuelAmount}单位额外的燃料`)
      }
      break
  }
}
</script>

<template>
  <div class="season-panel">
    <div class="season-header">
      <div class="season-icon" :style="{ color: currentSeason.color }">{{ currentSeason.icon }}</div>
      <div class="season-info">
        <div class="season-name" :style="{ color: currentSeason.color }">{{ currentSeason.name }}</div>
        <el-tooltip :content="currentSeason.description" placement="bottom" effect="light">
          <el-progress :percentage="seasonProgress" :color="currentSeason.color"
            :format="() => `${daysToNextSeason}天后进入${nextSeason.name}`" :stroke-width="8" />
        </el-tooltip>
      </div>
    </div>
    <div class="season-effects">
      <div class="effect-title">季节效果：</div>
      <div class="effect-list">
        <div class="effect-item" v-if="currentSeason.effects.foodGrowthRate !== 1.0">
          <span>食物生长：</span>
          <span
            :class="{ 'positive': currentSeason.effects.foodGrowthRate > 1.0, 'negative': currentSeason.effects.foodGrowthRate < 1.0 }">
            {{ currentSeason.effects.foodGrowthRate > 1.0 ? '+' : '' }}{{
              Math.round((currentSeason.effects.foodGrowthRate - 1) * 100) }}%
          </span>
        </div>
        <div class="effect-item" v-if="currentSeason.effects.herbGrowthRate !== 1.0">
          <span>草药生长：</span>
          <span
            :class="{ 'positive': currentSeason.effects.herbGrowthRate > 1.0, 'negative': currentSeason.effects.herbGrowthRate < 1.0 }">
            {{ currentSeason.effects.herbGrowthRate > 1.0 ? '+' : '' }}{{
              Math.round((currentSeason.effects.herbGrowthRate - 1) * 100) }}%
          </span>
        </div>
        <div class="effect-item" v-if="currentSeason.effects.energyConsumption !== 1.0">
          <span>体力消耗：</span>
          <span
            :class="{ 'positive': currentSeason.effects.energyConsumption < 1.0, 'negative': currentSeason.effects.energyConsumption > 1.0 }">
            {{ currentSeason.effects.energyConsumption < 1.0 ? '' : '+' }}{{
              Math.round((currentSeason.effects.energyConsumption - 1) * 100) }}% </span>
        </div>
        <div class="effect-item" v-if="currentSeason.effects.waterConsumption !== 1.0">
          <span>水分消耗：</span>
          <span
            :class="{ 'positive': currentSeason.effects.waterConsumption < 1.0, 'negative': currentSeason.effects.waterConsumption > 1.0 }">
            {{ currentSeason.effects.waterConsumption < 1.0 ? '' : '+' }}{{
              Math.round((currentSeason.effects.waterConsumption - 1) * 100) }}% </span>
        </div>
        <div class="effect-item" v-if="currentSeason.effects.mentalRecovery !== 1.0">
          <span>精神恢复：</span>
          <span
            :class="{ 'positive': currentSeason.effects.mentalRecovery > 1.0, 'negative': currentSeason.effects.mentalRecovery < 1.0 }">
            {{ currentSeason.effects.mentalRecovery > 1.0 ? '+' : '' }}{{
              Math.round((currentSeason.effects.mentalRecovery - 1) * 100) }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.season-panel {
  background-color: var(--el-bg-color-overlay);
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.season-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.season-icon {
  font-size: 2rem;
  margin-right: 10px;
}

.season-info {
  flex: 1;
}

.season-name {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.season-effects {
  margin-top: 10px;
}

.effect-title {
  font-weight: bold;
  margin-bottom: 5px;
  font-size: 0.9rem;
  color: var(--el-text-color-secondary);
}

.effect-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.effect-item {
  font-size: 0.85rem;
  background-color: var(--el-fill-color-lighter);
  padding: 2px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.positive {
  color: #67c23a;
}

.negative {
  color: #f56c6c;
}
</style>