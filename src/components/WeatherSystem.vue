<script setup>
import { ref, computed, watch } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()

// 天气类型及其在不同季节的概率
const weatherTypes = {
  clear: { name: '晴朗', icon: '☀️', effect: '视野良好，采集效率+10%', animation: 'weather-clear' },
  cloudy: { name: '多云', icon: '⛅', effect: '温度适宜，体力消耗-5%', animation: 'weather-cloudy' },
  rainy: { name: '小雨', icon: '🌧️', effect: '水资源收集+20%，移动速度-10%', animation: 'weather-rainy' },
  heavyRain: { name: '暴雨', icon: '⛈️', effect: '水资源收集+50%，采集效率-30%，有触发洪水风险', animation: 'weather-heavy-rain' },
  foggy: { name: '雾天', icon: '🌫️', effect: '视野受限，探索效率-20%', animation: 'weather-foggy' },
  windy: { name: '大风', icon: '🌬️', effect: '体力消耗+10%，有机会发现特殊资源', animation: 'weather-windy' },
  hot: { name: '酷热', icon: '🔥', effect: '水分消耗+30%，体力恢复-20%', animation: 'weather-hot' },
  cold: { name: '寒冷', icon: '❄️', effect: '食物消耗+30%，体力恢复-20%', animation: 'weather-cold' },
  snow: { name: '降雪', icon: '🌨️', effect: '移动速度-30%，采集效率-20%', animation: 'weather-snow' },
  storm: { name: '风暴', icon: '🌪️', effect: '无法外出，有触发灾害风险', animation: 'weather-storm' },
  rainbow: { name: '彩虹', icon: '🌈', effect: '精神恢复+20%，有机会发现稀有资源', animation: 'weather-rainbow' },
  hail: { name: '冰雹', icon: '🧊', effect: '外出危险，作物损失风险+30%', animation: 'weather-hail' },
  sandstorm: { name: '沙尘暴', icon: '🏜️', effect: '视野严重受限，体力消耗+40%', animation: 'weather-sandstorm' },
  aurora: { name: '极光', icon: '✨', effect: '精神恢复+30%，研究效率+15%', animation: 'weather-aurora' }
}

// 季节天气概率配置
const seasonWeatherProbability = {
  spring: {
    clear: 0.22,
    cloudy: 0.22,
    rainy: 0.22,
    foggy: 0.08,
    windy: 0.05,
    heavyRain: 0.08,
    hot: 0.0,
    cold: 0.02,
    snow: 0.0,
    storm: 0.0,
    rainbow: 0.08,
    hail: 0.03,
    sandstorm: 0.0,
    aurora: 0.0
  },
  summer: {
    clear: 0.30,
    cloudy: 0.12,
    rainy: 0.08,
    foggy: 0.03,
    windy: 0.05,
    heavyRain: 0.1,
    hot: 0.15,
    cold: 0.0,
    snow: 0.0,
    storm: 0.05,
    rainbow: 0.05,
    hail: 0.02,
    sandstorm: 0.05,
    aurora: 0.0
  },
  autumn: {
    clear: 0.18,
    cloudy: 0.22,
    rainy: 0.18,
    foggy: 0.12,
    windy: 0.1,
    heavyRain: 0.05,
    hot: 0.0,
    cold: 0.05,
    snow: 0.0,
    storm: 0.0,
    rainbow: 0.07,
    hail: 0.0,
    sandstorm: 0.03,
    aurora: 0.0
  },
  winter: {
    clear: 0.12,
    cloudy: 0.12,
    rainy: 0.0,
    foggy: 0.08,
    windy: 0.08,
    heavyRain: 0.0,
    hot: 0.0,
    cold: 0.25,
    snow: 0.15,
    storm: 0.05,
    rainbow: 0.0,
    hail: 0.08,
    sandstorm: 0.0,
    aurora: 0.07
  }
}

// 当前天气
const currentWeather = ref(weatherTypes.clear)

// 天气持续时间（小时）
const weatherDuration = ref(6)

// 下次天气变化时间
const nextWeatherChangeTime = ref({
  day: gameStore.gameTime.day,
  hour: gameStore.gameTime.hour + weatherDuration.value
})

// 获取当前季节的英文名称
const currentSeasonKey = computed(() => {
  const seasonNames = ['spring', 'summer', 'autumn', 'winter']
  const day = gameStore.gameTime.day
  const seasonLength = 30 // 每个季节30天
  const seasonIndex = Math.floor((day - 1) % (seasonLength * 4) / seasonLength)
  return seasonNames[seasonIndex]
})

// 根据季节和时间生成天气
const generateWeather = () => {
  const season = currentSeasonKey.value
  const probabilities = seasonWeatherProbability[season]
  const hour = gameStore.gameTime.hour
  const day = gameStore.gameTime.day
  // 特殊季节性天气事件
  // 季节特定事件概率
  let seasonalEventChance = 0.05 // 基础概率5%
  // 满月特殊天气事件 (每30天一次满月)
  if (day % 30 === 15) { // 假设第15天是满月
    if (hour >= 19 || hour <= 5) { // 夜间
      if (Math.random() < 0.4) { // 40%概率触发满月特殊天气
        if (season === 'winter') {
          // 冬季满月可能出现极光
          currentWeather.value = weatherTypes.aurora
          weatherDuration.value = 4 + Math.floor(Math.random() * 3) // 4-6小时
          gameStore.addToEventLog(`冬季满月之夜，${weatherTypes.aurora.name}在天空中舞动，${weatherTypes.aurora.effect}`)
          return
        } else {
          // 其他季节满月可能带来清澈的夜空
          currentWeather.value = weatherTypes.clear
          weatherDuration.value = 6 + Math.floor(Math.random() * 3) // 6-8小时
          gameStore.addToEventLog(`满月之夜，天空格外${weatherTypes.clear.name}，月光照亮了四周`)
          // 满月之夜精神恢复加成
          gameStore.player.mental = Math.min(gameStore.player.mental + 5, gameStore.player.maxMental)
          return
        }
      }
    }
  }
  // 雨后彩虹特殊事件
  if ((currentWeather.value.name === '小雨' || currentWeather.value.name === '暴雨') &&
    hour >= 7 && hour <= 18 && Math.random() < 0.3) {
    currentWeather.value = weatherTypes.rainbow
    weatherDuration.value = 1 + Math.floor(Math.random() * 2) // 1-2小时
    gameStore.addToEventLog(`雨过天晴，${weatherTypes.rainbow.name}出现在天空中，${weatherTypes.rainbow.effect}`)
    return
  }
  // 根据季节和时间调整特殊事件概率
  if (season === 'spring' && hour >= 5 && hour <= 10) {
    // 春季早晨更容易起雾
    if (Math.random() < 0.15) {
      currentWeather.value = weatherTypes.foggy
      weatherDuration.value = 2 + Math.floor(Math.random() * 3) // 2-4小时
      gameStore.addToEventLog(`春季清晨，${weatherTypes.foggy.name}笼罩了四周，${weatherTypes.foggy.effect}`)
      return
    }
    // 春季雨后可能出现彩虹
    if (hour >= 8 && currentWeather.value.name === '小雨' && Math.random() < 0.25) {
      currentWeather.value = weatherTypes.rainbow
      weatherDuration.value = 2 + Math.floor(Math.random() * 2) // 2-3小时
      gameStore.addToEventLog(`春雨过后，美丽的${weatherTypes.rainbow.name}挂在天空，${weatherTypes.rainbow.effect}`)
      return
    }
  } else if (season === 'summer' && hour >= 12 && hour <= 15) {
    // 夏季中午更容易出现酷热
    if (Math.random() < 0.2) {
      currentWeather.value = weatherTypes.hot
      weatherDuration.value = 3 + Math.floor(Math.random() * 4) // 3-6小时
      gameStore.addToEventLog(`夏季正午，${weatherTypes.hot.name}难以忍受，${weatherTypes.hot.effect}`)
      return
    }
    // 夏季午后可能出现沙尘暴
    if (day > 15 && Math.random() < 0.1) { // 夏季后半段
      currentWeather.value = weatherTypes.sandstorm
      weatherDuration.value = 2 + Math.floor(Math.random() * 3) // 2-4小时
      gameStore.addToEventLog(`夏季干燥的空气中，${weatherTypes.sandstorm.name}突然袭来，${weatherTypes.sandstorm.effect}`)
      return
    }
  } else if (season === 'autumn' && hour >= 16 && hour <= 19) {
    // 秋季傍晚更容易起风
    if (Math.random() < 0.15) {
      currentWeather.value = weatherTypes.windy
      weatherDuration.value = 3 + Math.floor(Math.random() * 3) // 3-5小时
      gameStore.addToEventLog(`秋季傍晚，${weatherTypes.windy.name}呼啸而过，${weatherTypes.windy.effect}`)
      return
    }
    // 秋季可能出现沙尘暴
    if (day > 20 && Math.random() < 0.08) { // 秋季末期
      currentWeather.value = weatherTypes.sandstorm
      weatherDuration.value = 3 + Math.floor(Math.random() * 2) // 3-4小时
      gameStore.addToEventLog(`秋季干燥的空气中，${weatherTypes.sandstorm.name}席卷而来，${weatherTypes.sandstorm.effect}`)
      return
    }
  } else if (season === 'winter' && (hour <= 6 || hour >= 18)) {
    // 冬季夜间更容易变得寒冷
    if (Math.random() < 0.25) {
      currentWeather.value = weatherTypes.cold
      weatherDuration.value = 4 + Math.floor(Math.random() * 5) // 4-8小时
      gameStore.addToEventLog(`冬季夜晚，${weatherTypes.cold.name}刺骨，${weatherTypes.cold.effect}`)
      return
    }
    // 冬季夜间可能出现极光
    if (hour >= 20 && Math.random() < 0.1) {
      currentWeather.value = weatherTypes.aurora
      weatherDuration.value = 3 + Math.floor(Math.random() * 4) // 3-6小时
      gameStore.addToEventLog(`冬季夜空中，神秘的${weatherTypes.aurora.name}绽放开来，${weatherTypes.aurora.effect}`)
      return
    }
  }
  // 特殊事件：冰雹 (主要在冬季和春季末尾)
  const hailChance = season === 'winter' ? 0.08 :
    (season === 'spring' && day > 25) ? 0.05 : 0.01
  if (Math.random() < hailChance) {
    currentWeather.value = weatherTypes.hail
    weatherDuration.value = 1 + Math.floor(Math.random() * 3) // 冰雹持续1-3小时
    gameStore.addToEventLog(`突然间，${weatherTypes.hail.name}从天而降，${weatherTypes.hail.effect}！`)
    return
  }
  // 特殊事件：风暴 (根据季节调整概率)
  const stormChance = season === 'winter' ? 0.05 : season === 'summer' ? 0.05 : 0.01
  if (Math.random() < stormChance) {
    currentWeather.value = weatherTypes.storm
    weatherDuration.value = 2 + Math.floor(Math.random() * 4) // 风暴持续2-5小时
    gameStore.addToEventLog(`一场${weatherTypes.storm.name}来袭，${weatherTypes.storm.effect}！`)
    return
  }
  // 正常天气生成
  let random = Math.random()
  let cumulativeProbability = 0
  for (const [type, probability] of Object.entries(probabilities)) {
    cumulativeProbability += probability
    if (random <= cumulativeProbability) {
      const newWeather = weatherTypes[type]
      // 只有当天气变化时才记录日志
      if (currentWeather.value.name !== newWeather.name) {
        currentWeather.value = newWeather
        gameStore.addToEventLog(`天气变为${newWeather.name}，${newWeather.effect}`)
      } else {
        currentWeather.value = newWeather
      }
      break
    }
  }
  // 设置天气持续时间（根据季节调整）
  const baseDuration = 4
  let durationVariation = 5
  // 冬季和夏季的天气持续时间更长
  if (season === 'winter' || season === 'summer') durationVariation = 8
  weatherDuration.value = baseDuration + Math.floor(Math.random() * durationVariation)
}

// 更新下次天气变化时间
const updateNextWeatherChangeTime = () => {
  let nextDay = gameStore.gameTime.day
  let nextHour = gameStore.gameTime.hour + weatherDuration.value
  // 处理跨天情况
  while (nextHour >= 24) {
    nextHour -= 24
    nextDay += 1
  }
  nextWeatherChangeTime.value = {
    day: nextDay,
    hour: nextHour
  }
}

// 检查是否需要更新天气
const checkWeatherChange = () => {
  const currentDay = gameStore.gameTime.day
  const currentHour = gameStore.gameTime.hour
  if (currentDay > nextWeatherChangeTime.value.day || (currentDay === nextWeatherChangeTime.value.day && currentHour >= nextWeatherChangeTime.value.hour)) {
    generateWeather()
    updateNextWeatherChangeTime()
    applyWeatherEffects()
  }
}

// 应用天气效果
const applyWeatherEffects = () => {
  // 获取当前季节
  const season = currentSeasonKey.value
  // 重置天气效果
  const weatherEffects = {
    gatheringEfficiency: 1.0,
    energyConsumption: 1.0,
    waterConsumption: 1.0,
    foodConsumption: 1.0,
    movementSpeed: 1.0,
    explorationEfficiency: 1.0,
    mentalRecovery: 1.0,
    researchEfficiency: 1.0
  }
  // 根据天气类型应用基础效果
  switch (currentWeather.value.name) {
    case '晴朗':
      weatherEffects.gatheringEfficiency = 1.1 // 采集效率+10%
      // 春季晴天额外加成
      if (season === 'spring') weatherEffects.gatheringEfficiency = 1.15 // 春季晴天采集效率+15%
      break
    case '多云':
      weatherEffects.energyConsumption = 0.95 // 体力消耗-5%
      break
    case '小雨':
      // 增加水资源
      const waterBonus = 2
      gameStore.addResource('water', waterBonus)
      weatherEffects.movementSpeed = 0.9 // 移动速度-10%
      // 春季雨天对植物生长有额外好处
      if (season === 'spring') {
        if (Math.random() < 0.3) {
          const herbBonus = Math.floor(Math.random() * 2) + 1
          gameStore.addResource('herb', herbBonus)
          gameStore.addToEventLog(`春雨滋润了植物，你额外发现了${herbBonus}单位草药`)
        }
      }
      break
    case '暴雨':
      // 增加水资源
      const heavyWaterBonus = 5
      gameStore.addResource('water', heavyWaterBonus)
      weatherEffects.gatheringEfficiency = 0.7 // 采集效率-30%
      weatherEffects.movementSpeed = 0.7 // 移动速度-30%
      // 夏季暴雨可能导致洪水风险
      if (season === 'summer' && Math.random() < 0.2) {
        gameStore.addToEventLog('暴雨引发了小规模洪水，部分资源被冲走了')
        // 随机损失一些资源
        const lostResource = Math.random() < 0.5 ? 'food' : 'wood'
        const lostAmount = Math.floor(Math.random() * 3) + 1
        gameStore.consumeResource(lostResource, lostAmount)
      }
      break
    case '雾天':
      weatherEffects.explorationEfficiency = 0.8 // 探索效率-20%
      // 秋季的雾更加浓重
      if (season === 'autumn') weatherEffects.explorationEfficiency = 0.7 // 秋季雾天探索效率-30%
      break
    case '大风':
      weatherEffects.energyConsumption = 1.1 // 体力消耗+10%
      // 秋季大风可能带来特殊资源
      if (season === 'autumn' && Math.random() < 0.3) {
        const resourceType = Math.random() < 0.7 ? 'wood' : 'herb'
        const bonusAmount = Math.floor(Math.random() * 3) + 1
        gameStore.addResource(resourceType, bonusAmount)
        gameStore.addToEventLog(`秋风带来了一些${resourceType === 'wood' ? '木材' : '草药'}`)
      }
      break
    case '酷热':
      weatherEffects.waterConsumption = 1.3 // 水分消耗+30%
      weatherEffects.energyConsumption = 1.2 // 体力消耗+20%
      // 夏季酷热更加难熬
      if (season === 'summer') {
        weatherEffects.waterConsumption = 1.5 // 夏季酷热水分消耗+50%
        gameStore.consumeResource('water', 1) // 额外消耗水分
        gameStore.addToEventLog('夏季酷热难耐，你需要更多的水分')
      }
      break
    case '寒冷':
      weatherEffects.foodConsumption = 1.3 // 食物消耗+30%
      weatherEffects.energyConsumption = 1.2 // 体力消耗+20%
      // 冬季寒冷更加严峻
      if (season === 'winter') {
        weatherEffects.foodConsumption = 1.5 // 冬季寒冷食物消耗+50%
        gameStore.consumeResource('food', 1) // 额外消耗食物
        gameStore.addToEventLog('冬季寒冷刺骨，你需要更多的食物来保持体温')
      }
      break
    case '降雪':
      weatherEffects.movementSpeed = 0.7 // 移动速度-30%
      weatherEffects.gatheringEfficiency = 0.8 // 采集效率-20%
      weatherEffects.foodConsumption = 1.2 // 食物消耗+20%
      // 冬季降雪可能带来特殊事件
      if (season === 'winter' && Math.random() < 0.2) {
        if (Math.random() < 0.5) {
          // 积雪覆盖了一些资源
          gameStore.addToEventLog('厚厚的积雪覆盖了大地，你发现了一些被掩埋的资源')
          const resourceType = Math.random() < 0.6 ? 'stone' : 'metal'
          const bonusAmount = Math.floor(Math.random() * 2) + 1
          gameStore.addResource(resourceType, bonusAmount)
        } else {
          // 积雪阻碍了行动
          gameStore.addToEventLog('厚厚的积雪阻碍了你的行动，消耗了更多体力')
          gameStore.player.energy = Math.max(gameStore.player.energy - 5, 0)
        }
      }
      break
    case '风暴':
      weatherEffects.movementSpeed = 0.5 // 移动速度-50%
      weatherEffects.explorationEfficiency = 0.5 // 探索效率-50%
      weatherEffects.energyConsumption = 1.3 // 体力消耗+30%
      // 风暴有触发灾害的风险
      if (Math.random() < 0.3) {
        const disasterType = Math.random() < 0.5 ? '建筑损坏' : '资源损失'
        if (disasterType === '建筑损坏' && gameStore.buildings.length > 1) {
          // 随机选择一个非基础建筑
          const nonBasicBuildings = gameStore.buildings.filter(b => b.id !== 'campfire')
          if (nonBasicBuildings.length > 0) {
            const randomBuilding = nonBasicBuildings[Math.floor(Math.random() * nonBasicBuildings.length)]
            gameStore.addToEventLog(`风暴损坏了你的${randomBuilding.name}，效果暂时减半`)
            // 这里可以添加建筑损坏的逻辑
          }
        } else {
          // 资源损失
          const resources = ['food', 'water', 'wood', 'stone']
          const randomResource = resources[Math.floor(Math.random() * resources.length)]
          const lostAmount = Math.floor(Math.random() * 5) + 3
          gameStore.consumeResource(randomResource, lostAmount)
          gameStore.addToEventLog(`风暴导致你损失了${lostAmount}单位${randomResource === 'food' ? '食物' :
            randomResource === 'water' ? '水' :
              randomResource === 'wood' ? '木材' : '石头'}`)
        }
      }
      break
    case '彩虹':
      weatherEffects.mentalRecovery = 1.2 // 精神恢复+20%
      gameStore.player.mental = Math.min(gameStore.player.mental + 5, gameStore.player.maxMental)
      // 彩虹可能带来稀有资源
      if (Math.random() < 0.25) {
        const rareResource = Math.random() < 0.7 ? 'techFragment' : 'ancientRelic'
        const amount = 1
        gameStore.addResource(rareResource, amount)
        gameStore.addToEventLog(`彩虹的出现带来了好运，你发现了一个${rareResource === 'techFragment' ? '科技碎片' : '古代遗物'}`)
      }
      break
    case '冰雹':
      weatherEffects.movementSpeed = 0.6 // 移动速度-40%
      weatherEffects.gatheringEfficiency = 0.7 // 采集效率-30%
      // 冰雹可能造成资源损失
      if (Math.random() < 0.3) {
        const lostFood = Math.floor(Math.random() * 3) + 2
        gameStore.consumeResource('food', lostFood)
        gameStore.addToEventLog(`冰雹砸坏了一些食物储备，你损失了${lostFood}单位食物`)
      }
      // 冰雹可能造成伤害
      if (Math.random() < 0.2) {
        const damage = Math.floor(Math.random() * 5) + 3
        gameStore.player.health = Math.max(gameStore.player.health - damage, 0)
        gameStore.addToEventLog(`你被冰雹砸中，受到了${damage}点伤害`)
      }
      break
    case '沙尘暴':
      weatherEffects.explorationEfficiency = 0.5 // 探索效率-50%
      weatherEffects.energyConsumption = 1.4 // 体力消耗+40%
      weatherEffects.waterConsumption = 1.3 // 水分消耗+30%
      // 沙尘暴可能导致迷路
      if (Math.random() < 0.2) {
        const energyLoss = Math.floor(Math.random() * 10) + 5
        gameStore.player.energy = Math.max(gameStore.player.energy - energyLoss, 0)
        gameStore.addToEventLog(`沙尘暴中你迷失了方向，额外消耗了${energyLoss}点体力`)
      }
      // 沙尘暴可能掩埋资源
      if (season === 'summer' && Math.random() < 0.15) {
        const buriedResource = Math.random() < 0.6 ? 'metal' : 'stone'
        const amount = Math.floor(Math.random() * 3) + 2
        gameStore.addResource(buriedResource, amount)
        gameStore.addToEventLog(`沙尘暴过后，你发现了被掩埋的${buriedResource === 'metal' ? '金属' : '石头'}`)
      }
      break
    case '极光':
      weatherEffects.mentalRecovery = 1.3 // 精神恢复+30%
      weatherEffects.researchEfficiency = 1.15 // 研究效率+15%
      gameStore.player.mental = Math.min(gameStore.player.mental + 10, gameStore.player.maxMental)
      // 极光可能带来灵感
      if (Math.random() < 0.3) {
        const techBonus = Math.floor(Math.random() * 2) + 1
        gameStore.addResource('techFragment', techBonus)
        gameStore.addToEventLog(`极光的神秘体力激发了你的灵感，你获得了${techBonus}个科技碎片`)
      }
      // 冬季极光特殊效果
      if (season === 'winter' && Math.random() < 0.2) {
        gameStore.player.energy = Math.min(gameStore.player.energy + 15, gameStore.player.maxEnergy)
        gameStore.addToEventLog('冬季极光的体力滋养了你的身体，恢复了一些体力')
      }
      break
  }
  // 将天气效果应用到游戏状态
  gameStore.weather.effects = weatherEffects
}

// 获取下次天气变化时间的格式化显示
const formattedNextChange = computed(() => {
  const { day, hour } = nextWeatherChangeTime.value
  return `第${day}天 ${hour}:00`
})

// 监听游戏时间变化
watch(() => [gameStore.gameTime.day, gameStore.gameTime.hour], () => checkWeatherChange())

// 获取当前季节的图标
const getSeasonIcon = () => {
  const season = currentSeasonKey.value
  switch (season) {
    case 'spring': return '🌱'
    case 'summer': return '☀️'
    case 'autumn': return '🍂'
    case 'winter': return '❄️'
    default: return '🌱'
  }
}

// 获取当前季节的中文名称
const getSeasonName = () => {
  const season = currentSeasonKey.value
  switch (season) {
    case 'spring': return '春季'
    case 'summer': return '夏季'
    case 'autumn': return '秋季'
    case 'winter': return '冬季'
    default: return '春季'
  }
}

// 初始化天气
generateWeather()
updateNextWeatherChangeTime()
</script>

<template>
  <div class="weather-system" :class="currentWeather.animation">
    <div class="weather-display">
      <div class="weather-icon">{{ currentWeather.icon }}</div>
      <div class="weather-info">
        <div class="weather-name">{{ currentWeather.name }}</div>
        <div class="weather-effect">{{ currentWeather.effect }}</div>
      </div>
    </div>
    <div class="weather-forecast">
      <span class="forecast-label">预计变化: </span>
      <span class="forecast-time">{{ formattedNextChange }}</span>
    </div>
    <div class="weather-animation-container">
      <div class="weather-animation-elements"></div>
    </div>
    <div class="current-season-indicator">
      <span class="season-icon">{{ getSeasonIcon() }}</span>
      <span class="season-name">{{ getSeasonName() }}</span>
    </div>
  </div>
</template>

<style scoped>
.weather-system {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  margin-bottom: 10px;
  background-color: var(--el-bg-color);
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  transition: background-color 1s ease;
}

.weather-display {
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 2;
}

.weather-icon {
  font-size: 2rem;
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

.weather-info {
  display: flex;
  flex-direction: column;
}

.weather-name {
  font-weight: bold;
  font-size: 1.1em;
}

.weather-effect {
  font-size: 0.8em;
  color: var(--el-text-color-secondary);
}

.weather-forecast {
  display: flex;
  justify-content: space-between;
  font-size: 0.9em;
  color: var(--el-text-color-secondary);
  margin-top: 5px;
  z-index: 2;
}

.current-season-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  font-size: 0.9em;
  color: var(--el-text-color-secondary);
  z-index: 2;
}

.season-icon {
  font-size: 1.2em;
}

.weather-animation-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0.4;
}

/* 天气动画样式 */
.weather-clear {
  background-color: rgba(255, 248, 220, 0.3);
}

.weather-cloudy {
  background-color: rgba(240, 240, 240, 0.3);
}

.weather-cloudy .weather-animation-elements::before {
  content: '☁️';
  position: absolute;
  font-size: 1.5rem;
  animation: float 20s infinite linear;
  opacity: 0.7;
  top: 10%;
  left: 10%;
}

.weather-cloudy .weather-animation-elements::after {
  content: '☁️';
  position: absolute;
  font-size: 1.2rem;
  animation: float 15s infinite linear 5s;
  opacity: 0.5;
  top: 30%;
  left: 50%;
}

.weather-rainy .weather-animation-elements {
  background: linear-gradient(to bottom, transparent, rgba(100, 100, 240, 0.1));
}

.weather-rainy .weather-animation-elements::before,
.weather-rainy .weather-animation-elements::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, transparent 0%, rgba(100, 100, 240, 0.2) 100%);
  animation: rain 1s infinite linear;
}

.weather-heavy-rain .weather-animation-elements {
  background: linear-gradient(to bottom, transparent, rgba(80, 80, 220, 0.2));
}

.weather-heavy-rain .weather-animation-elements::before,
.weather-heavy-rain .weather-animation-elements::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, transparent 0%, rgba(80, 80, 220, 0.3) 100%);
  animation: heavyRain 0.7s infinite linear;
}

.weather-foggy {
  background-color: rgba(220, 220, 220, 0.4);
}

.weather-foggy .weather-animation-elements {
  background: repeating-linear-gradient(45deg,
      rgba(200, 200, 200, 0.1),
      rgba(200, 200, 200, 0.1) 10px,
      rgba(220, 220, 220, 0.2) 10px,
      rgba(220, 220, 220, 0.2) 20px);
  animation: fog 10s infinite ease-in-out;
}

.weather-windy .weather-animation-elements::before {
  content: '〰️';
  position: absolute;
  font-size: 1rem;
  animation: wind 8s infinite linear;
  opacity: 0.6;
  top: 30%;
  left: 0;
}

.weather-windy .weather-animation-elements::after {
  content: '〰️';
  position: absolute;
  font-size: 1rem;
  animation: wind 6s infinite linear 2s;
  opacity: 0.6;
  top: 60%;
  left: 0;
}

.weather-hot {
  background-color: rgba(255, 200, 150, 0.3);
}

.weather-hot .weather-animation-elements {
  background: linear-gradient(to bottom, rgba(255, 200, 150, 0.1), rgba(255, 150, 100, 0.2));
  animation: heat 3s infinite ease-in-out;
}

.weather-cold {
  background-color: rgba(200, 220, 255, 0.3);
}

.weather-cold .weather-animation-elements {
  background: linear-gradient(to bottom, rgba(200, 220, 255, 0.1), rgba(180, 200, 255, 0.2));
}

.weather-snow .weather-animation-elements::before,
.weather-snow .weather-animation-elements::after {
  content: '❄';
  position: absolute;
  font-size: 0.8rem;
  animation: snow 10s infinite linear;
  opacity: 0.7;
  top: -10%;
  left: 30%;
}

.weather-snow .weather-animation-elements::after {
  font-size: 0.6rem;
  animation: snow 8s infinite linear 2s;
  top: -10%;
  left: 60%;
}

.weather-storm {
  background-color: rgba(80, 80, 100, 0.3);
}

.weather-storm .weather-animation-elements::before {
  content: '⚡';
  position: absolute;
  font-size: 1.5rem;
  animation: lightning 5s infinite ease-out;
  opacity: 0;
  top: 20%;
  left: 30%;
}

.weather-rainbow {
  background: linear-gradient(to bottom, rgba(255, 200, 200, 0.1), rgba(200, 200, 255, 0.1));
}

.weather-rainbow .weather-animation-elements {
  background: linear-gradient(to bottom,
      rgba(255, 0, 0, 0.05),
      rgba(255, 165, 0, 0.05),
      rgba(255, 255, 0, 0.05),
      rgba(0, 128, 0, 0.05),
      rgba(0, 0, 255, 0.05),
      rgba(75, 0, 130, 0.05),
      rgba(238, 130, 238, 0.05));
  border-radius: 50%;
  width: 200%;
  height: 200%;
  position: absolute;
  top: 50%;
  left: -50%;
  transform: translateY(-50%);
  opacity: 0.3;
  animation: rainbow 10s infinite ease-in-out;
}

.weather-hail .weather-animation-elements::before,
.weather-hail .weather-animation-elements::after {
  content: '•';
  position: absolute;
  font-size: 1rem;
  font-weight: bold;
  animation: hail 1s infinite linear;
  opacity: 0.7;
  top: -10%;
  left: 30%;
  color: rgba(200, 220, 255, 0.8);
}

.weather-hail .weather-animation-elements::after {
  font-size: 0.8rem;
  animation: hail 0.8s infinite linear 0.3s;
  top: -10%;
  left: 60%;
}

.weather-sandstorm {
  background-color: rgba(210, 180, 140, 0.3);
}

.weather-sandstorm .weather-animation-elements {
  background: repeating-linear-gradient(45deg,
      rgba(210, 180, 140, 0.1),
      rgba(210, 180, 140, 0.1) 10px,
      rgba(190, 160, 120, 0.2) 10px,
      rgba(190, 160, 120, 0.2) 20px);
  animation: sandstorm 2s infinite linear;
}

.weather-aurora {
  background-color: rgba(50, 50, 80, 0.3);
}

.weather-aurora .weather-animation-elements {
  background: linear-gradient(to bottom,
      rgba(50, 200, 100, 0.1),
      rgba(100, 100, 200, 0.1),
      rgba(200, 100, 200, 0.1));
  animation: aurora 8s infinite ease-in-out;
}

/* 动画关键帧 */
@keyframes float {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

@keyframes rain {
  0% {
    background-position: 0 0;
  }

  100% {
    background-position: 0 20px;
  }
}

@keyframes heavyRain {
  0% {
    background-position: 0 0;
  }

  100% {
    background-position: 0 30px;
  }
}

@keyframes fog {
  0% {
    opacity: 0.3;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 0.3;
  }
}

@keyframes wind {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

@keyframes heat {
  0% {
    opacity: 0.3;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 0.3;
  }
}

@keyframes snow {
  0% {
    transform: translateY(0) rotate(0deg);
  }

  100% {
    transform: translateY(150px) rotate(360deg);
  }
}

@keyframes lightning {
  0% {
    opacity: 0;
  }

  10% {
    opacity: 0.8;
  }

  11% {
    opacity: 0.4;
  }

  12% {
    opacity: 0.8;
  }

  13% {
    opacity: 0;
  }

  100% {
    opacity: 0;
  }
}

@keyframes rainbow {
  0% {
    opacity: 0.2;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 0.2;
  }
}

@keyframes hail {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(150px);
  }
}

@keyframes sandstorm {
  0% {
    background-position: 0 0;
  }

  100% {
    background-position: 20px 20px;
  }
}

@keyframes aurora {
  0% {
    opacity: 0.3;
    transform: translateY(0);
  }

  50% {
    opacity: 0.5;
    transform: translateY(5px);
  }

  100% {
    opacity: 0.3;
    transform: translateY(0);
  }
}
</style>