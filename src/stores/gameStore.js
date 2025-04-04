import { defineStore } from 'pinia'
import { omit } from 'lodash-es'
import { encryptData, decryptData } from '../plugins/crypto'
import { recipes } from '../plugins/recipes'

export const useGameStore = defineStore('game', {
  state: () => ({
    // 玩家基本信息
    player: {
      name: '幸存者',
      level: 1,
      exp: 0,
      expToNextLevel: 100,
      health: 100,
      maxHealth: 100,
      energy: 100,
      maxEnergy: 100,
      mental: 100,
      maxMental: 100,
      // 生存天数
      days: 0,
      // 轮回次数
      cycles: 0,
    },
    // 季节系统
    season: {
      // 季节长度（天）
      seasonLength: 30,
      // 季节效果
      effects: {
        foodGrowthRate: 1.0,
        herbGrowthRate: 1.0,
        energyConsumption: 1.0,
        waterConsumption: 1.0,
        mentalRecovery: 1.0
      }
    },
    // 天气系统
    weather: {
      current: 'clear', // 当前天气类型
      duration: 6, // 持续时间（小时）
      nextChangeDay: 1, // 下次变化的天数
      nextChangeHour: 6, // 下次变化的小时
      effects: {
        gatheringEfficiency: 1.0, // 采集效率修正
        energyConsumption: 1.0, // 能量消耗修正
        waterConsumption: 1.0, // 水消耗修正
        foodConsumption: 1.0, // 食物消耗修正
        movementSpeed: 1.0, // 移动速度修正
        explorationEfficiency: 1.0 // 探索效率修正
      }
    },
    // 基础资源
    resources: {
      food: 10,
      water: 10,
      wood: 0,
      stone: 0,
      metal: 0,
      herb: 0,
      // 高级资源
      medicine: 0,
      tools: 0,
      parts: 0,
      fuel: 0,
      // 特殊资源
      ancientRelic: 0,
      techFragment: 0,
    },
    // 资源上限
    resourceLimits: {
      food: 50,
      water: 50,
      wood: 50,
      stone: 50,
      metal: 50,
      herb: 30,
      medicine: 20,
      tools: 10,
      parts: 10,
      fuel: 20,
      ancientRelic: 5,
      techFragment: 5,
    },
    // 技能等级
    skills: {
      gathering: 1, // 采集
      crafting: 1, // 制作
      combat: 1, // 战斗
      survival: 1, // 生存
      research: 1, // 研究
    },
    // 已解锁的建筑
    buildings: [],
    // 当前进行中的活动
    currentActivities: [],
    // 游戏时间
    gameTime: {
      day: 1,
      hour: 6, // 游戏从早上6点开始
      minute: 0,
      // 时间流逝速度，实际秒:游戏分钟
      timeScale: 1, // 1秒 = 1分钟游戏时间
    },
    // 游戏设置
    settings: {
      autoSave: true,
      darkMode: false,
      soundEnabled: true,
      notificationsEnabled: true,
    },
    // 事件日志
    eventLog: [],
    // 成就系统
    achievements: {
      // 已解锁的成就ID列表
      unlocked: [],
      // 成就相关的计数器
      explorationCount: 0,
      extremeWeatherSurvived: false,
      healthyDays: 0,
      // 其他成就相关的状态
      resourcesCollected: {
        food: 0,
        water: 0,
        wood: 0,
        stone: 0,
        metal: 0,
        herb: 0
      }
    },
    // 游戏状态
    gameState: 'playing', // playing, paused, gameover
  }),
  getters: {
    // 计算玩家总体实力
    playerPower: (state) => {
      return Object.values(state.skills).reduce((sum, level) => sum + level, 0)
    },
    // 计算资源总量
    totalResources: (state) => {
      return Object.values(state.resources).reduce((sum, amount) => sum + amount, 0)
    },
    // 计算当前时间字符串
    currentTimeString: (state) => {
      const { day, hour, minute } = state.gameTime
      return `第${day}天 ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    },
    // 检查资源是否足够
    hasEnoughResources: (state) => (requirements) => {
      for (const [resource, amount] of Object.entries(requirements)) {
        if (state.resources[resource] < amount) return false
      }
      return true
    },
  },
  actions: {
    // 初始化游戏
    initGame() {
      // 重置游戏状态
      this.$reset()
      localStorage.removeItem(__APP_NAME__)
      this.addToEventLog('你醒来了，发现自己身处一片荒野...')
    },
    // 保存游戏
    saveGame() {
      const filteredState = omit(this.$state, ['eventLog', 'currentActivities']);
      const encryptedData = encryptData(filteredState)
      if (encryptedData) {
        try {
          localStorage.setItem(__APP_NAME__, encryptedData)
          this.addToEventLog('游戏数据已保存')
        } catch (error) {
          this.addToEventLog('数据保存失败:', error)
        }
      } else {
        this.addToEventLog('数据加密失败')
      }
    },
    // 加载游戏
    loadGame() {
      const saveData = localStorage.getItem(__APP_NAME__)
      if (saveData) {
        try {
          this.$state = decryptData(saveData)
          this.addToEventLog('游戏已加载')
          return true
        } catch (error) {
          this.addToEventLog('数据加载失败:', error)
        }
      }
      return false
    },
    // 添加资源
    addResource(resource, amount) {
      if (!this.resources.hasOwnProperty(resource)) return false
      // 确保不超过上限
      const newAmount = this.resources[resource] + amount
      this.resources[resource] = Math.min(newAmount, this.resourceLimits[resource])
      return true
    },
    // 消耗资源
    consumeResource(resource, amount) {
      if (!this.resources.hasOwnProperty(resource)) return false
      if (this.resources[resource] < amount) return false
      this.resources[resource] -= amount
      return true
    },
    // 开始一个活动
    startActivity(recipeId) {
      const recipe = recipes().find(r => r.id === recipeId)
      if (!recipe) return false
      // 检查技能要求
      for (const [skill, level] of Object.entries(recipe.skillRequired)) {
        if (this.skills[skill] < level) {
          this.addToEventLog(`你的${skill}技能等级不足，无法进行${recipe.name}`)
          return false
        }
      }
      // 检查并消耗输入资源
      for (const [resource, amount] of Object.entries(recipe.inputs)) {
        if (resource === 'energy') {
          if (this.player.energy < amount) {
            this.addToEventLog('你的能量不足')
            return false
          }
          this.player.energy -= amount
        } else {
          if (!this.consumeResource(resource, amount)) {
            this.addToEventLog(`资源不足: ${resource}`)
            return false
          }
        }
      }
      // 创建活动
      const activity = {
        id: Date.now(),
        recipeId,
        name: recipe.name,
        startTime: Date.now(),
        duration: recipe.duration * 1000, // 转换为毫秒
        completed: false
      }
      this.currentActivities.push(activity)
      this.addToEventLog(`开始${recipe.name}`)
      // 设置定时器完成活动
      setTimeout(() => this.completeActivity(activity.id), recipe.duration * 1000)
      return true
    },
    // 完成活动
    completeActivity(activityId) {
      const activityIndex = this.currentActivities.findIndex(a => a.id === activityId)
      if (activityIndex === -1) return false
      const activity = this.currentActivities[activityIndex]
      const recipe = recipes().find(r => r.id === activity.recipeId)
      // 移除活动
      this.currentActivities.splice(activityIndex, 1)
      // 添加输出资源
      for (const [resource, range] of Object.entries(recipe.outputs)) {
        const [min, max] = range
        const amount = Math.floor(Math.random() * (max - min + 1)) + min
        this.addResource(resource, amount)
        this.addToEventLog(`获得 ${amount} ${this.getResourceName(resource)}`)
        // 更新成就系统的资源收集计数
        if (this.achievements.resourcesCollected.hasOwnProperty(resource)) this.achievements.resourcesCollected[resource] += amount
      }
      // 如果是探索活动，增加探索计数
      if (recipe.category === 'exploration') this.achievements.explorationCount += 1
      // 增加相关技能经验
      for (const skill in recipe.skillRequired) this.addSkillExp(skill, 1)
      return true
    },
    // 增加技能经验
    addSkillExp(skill, exp) {
      if (!this.skills.hasOwnProperty(skill)) return false
      // 技能名称映射
      const skillNames = {
        gathering: '采集',
        crafting: '制作',
        combat: '战斗',
        survival: '生存',
        research: '研究'
      }
      // 改进的技能成长系统
      // 技能等级越高，提升越困难
      const currentLevel = this.skills[skill]
      const chanceToLevel = 0.1 * exp / Math.sqrt(currentLevel)
      if (Math.random() < chanceToLevel) {
        this.skills[skill] += 1
        this.addToEventLog(`${skillNames[skill] || skill}技能提升到${this.skills[skill]}级！`)
        // 技能提升带来的额外奖励
        if (this.skills[skill] % 5 === 0) { // 每5级有特殊奖励
          switch (skill) {
            case 'gathering':
              this.player.maxEnergy += 5
              this.addToEventLog('你的采集技能提高，增加了最大能量值！')
              break
            case 'crafting':
              // 解锁新的制作配方
              this.addToEventLog('你的制作技能提高，可以制作更复杂的物品了！')
              break
            case 'combat':
              this.player.maxHealth += 10
              this.player.health += 10
              this.addToEventLog('你的战斗技能提高，增加了最大生命值！')
              break
            case 'survival':
              // 提高资源上限
              for (const key in this.resourceLimits) {
                this.resourceLimits[key] *= 1.1
              }
              this.addToEventLog('你的生存技能提高，可以储存更多资源了！')
              break
            case 'research':
              this.player.maxMental += 5
              this.player.mental += 5
              this.addToEventLog('你的研究技能提高，增加了最大精神值！')
              break
          }
        }
      }
      return true
    },
    // 推进游戏时间
    advanceTime(minutes) {
      this.gameTime.minute += minutes
      // 处理时间进位
      while (this.gameTime.minute >= 60) {
        this.gameTime.minute -= 60
        this.gameTime.hour += 1
        // 每小时消耗水和食物
        this.hourlyUpdate()
      }
      while (this.gameTime.hour >= 24) {
        this.gameTime.hour -= 24
        this.gameTime.day += 1
        this.player.days += 1
        // 每日更新
        this.dailyUpdate()
      }
    },
    // 每小时更新
    hourlyUpdate() {
      // 应用天气效果
      this.applyWeatherEffects();
      // 消耗基本资源（考虑天气影响）
      const waterConsumption = Math.ceil(1 * this.weather.effects.waterConsumption);
      const foodConsumption = Math.ceil(1 * this.weather.effects.foodConsumption);
      this.consumeResource('water', waterConsumption);
      this.consumeResource('food', foodConsumption);
      // 计算建筑提供的能量恢复加成
      let energyRecoveryBonus = 0;
      let mentalRecoveryBonus = 0;
      // 遍历所有建筑获取加成
      for (const building of this.buildings) {
        if (building.effects) {
          if (building.effects.energyRecovery) energyRecoveryBonus += building.effects.energyRecovery;
          if (building.effects.mentalRecovery) mentalRecoveryBonus += building.effects.mentalRecovery;
        }
      }
      // 恢复能量（考虑天气影响）
      let energyRecovery = 0;
      if (this.gameTime.hour >= 22 || this.gameTime.hour <= 6) {
        // 夜间休息恢复更多能量
        energyRecovery = 5 + energyRecoveryBonus;
      } else {
        energyRecovery = 1 + energyRecoveryBonus;
      }
      // 应用天气对能量恢复的影响
      if (this.weather.current === 'hot' || this.weather.current === 'cold') energyRecovery *= 0.8; // 极端天气减少能量恢复
      this.player.energy = Math.min(this.player.energy + energyRecovery, this.player.maxEnergy);
      // 恢复精神（考虑天气影响）
      if (mentalRecoveryBonus > 0) {
        // 恶劣天气对精神状态有负面影响
        let mentalEffect = 1.0;
        if (['storm', 'heavyRain', 'cold'].includes(this.weather.current)) {
          mentalEffect = 0.5; // 恶劣天气减半精神恢复
        } else if (this.weather.current === 'clear') {
          mentalEffect = 1.2; // 晴朗天气增加精神恢复
        }
        this.player.mental = Math.min(
          this.player.mental + (mentalRecoveryBonus * mentalEffect),
          this.player.maxMental
        );
      }
      // 检查资源状态并影响健康
      if (this.resources.food <= 0 || this.resources.water <= 0) {
        // 极端天气下，缺乏资源的影响更严重
        let healthPenalty = 5;
        if (['hot', 'cold', 'storm'].includes(this.weather.current)) {
          healthPenalty = 8;
          this.addToEventLog(`在${this.getWeatherName()}天气下，缺乏基本资源使你的健康迅速恶化！`);
        } else {
          this.addToEventLog('你感到饥饿和口渴，健康下降了');
        }
        this.player.health -= healthPenalty;
      }
      // 检查游戏结束条件
      if (this.player.health <= 0) this.gameOver();
    },
    // 每日更新
    dailyUpdate() {
      // 随机事件
      this.triggerRandomEvent()
      // 季节性资源自然恢复
      this.applySeasonalEffects()
      // 应用建筑效果(每天)
      this.applyBuildingEffectsDay()
      // 检查是否需要更新天气
      this.checkWeatherChange()
      // 更新成就系统的健康天数计数
      if (this.player.health >= 90) {
        this.achievements.healthyDays += 1
      } else {
        this.achievements.healthyDays = 0 // 重置连续健康天数
      }
      this.addToEventLog(`第${this.gameTime.day}天开始了`)
      // 自动保存
      if (this.settings.autoSave) this.saveGame()
    },
    // 应用季节性效果
    applySeasonalEffects() {
      const day = this.gameTime.day
      const seasonLength = this.season.seasonLength
      const seasonIndex = Math.floor((day - 1) % (seasonLength * 4) / seasonLength)
      const seasonKeys = ['spring', 'summer', 'autumn', 'winter']
      const currentSeasonKey = seasonKeys[seasonIndex]
      // 更新季节效果
      this.updateSeasonEffects(currentSeasonKey)
      // 根据季节应用不同效果
      switch (seasonIndex) {
        case 0: // 春季
          // 植物生长旺盛
          if (Math.random() < 0.3 * this.season.effects.foodGrowthRate) {
            const foodAmount = Math.floor(Math.random() * 3) + 1
            this.addResource('food', foodAmount)
            this.addToEventLog(`春季植物生长旺盛，你额外获得了${foodAmount}单位食物`)
          }
          if (Math.random() < 0.4 * this.season.effects.herbGrowthRate) {
            const herbAmount = Math.floor(Math.random() * 2) + 1
            this.addResource('herb', herbAmount)
            this.addToEventLog(`春季草药生长旺盛，你额外获得了${herbAmount}单位草药`)
          }
          break
        case 1: // 夏季
          // 高温导致水分消耗增加
          if (Math.random() < 0.3 * this.season.effects.waterConsumption) {
            this.consumeResource('water', 1)
            this.addToEventLog('夏季高温导致额外的水分消耗')
          }
          // 夏季可能发现特殊资源
          if (Math.random() < 0.15) {
            const randomResource = ['metal', 'stone', 'fuel'][Math.floor(Math.random() * 3)]
            const amount = Math.floor(Math.random() * 2) + 1
            this.addResource(randomResource, amount)
            this.addToEventLog(`在炎热的夏季，你发现了${amount}单位${this.getResourceName(randomResource)}`)
          }
          break
        case 2: // 秋季
          // 收获季节
          if (Math.random() < 0.3 * this.season.effects.foodGrowthRate) {
            const foodAmount = Math.floor(Math.random() * 4) + 2
            this.addResource('food', foodAmount)
            this.addToEventLog(`秋季是收获的季节，你额外获得了${foodAmount}单位食物`)
          }
          // 秋季可能找到额外的木材
          if (Math.random() < 0.2) {
            const woodAmount = Math.floor(Math.random() * 3) + 2
            this.addResource('wood', woodAmount)
            this.addToEventLog(`秋季落叶，你收集了${woodAmount}单位额外的木材`)
          }
          break
        case 3: // 冬季
          // 寒冷导致食物消耗增加
          if (Math.random() < 0.3 * this.season.effects.energyConsumption) {
            this.consumeResource('food', 1)
            this.addToEventLog('冬季寒冷导致额外的食物消耗')
          }
          // 冬季精神状态可能下降
          if (Math.random() < 0.2 && this.player.mental > 10) {
            this.player.mental -= 2
            this.addToEventLog('漫长的冬季让你感到有些压抑')
          }
          break
      }
      // 季节变化检测
      this.checkSeasonChange(day, seasonLength, seasonIndex)
    },
    // 更新季节效果
    updateSeasonEffects(seasonKey) {
      const seasonEffects = {
        spring: {
          foodGrowthRate: 1.2,
          herbGrowthRate: 1.3,
          energyConsumption: 0.9,
          waterConsumption: 1.0,
          mentalRecovery: 1.1
        },
        summer: {
          foodGrowthRate: 1.0,
          herbGrowthRate: 0.8,
          energyConsumption: 1.2,
          waterConsumption: 1.3,
          mentalRecovery: 0.9
        },
        autumn: {
          foodGrowthRate: 1.4,
          herbGrowthRate: 0.7,
          energyConsumption: 1.0,
          waterConsumption: 0.9,
          mentalRecovery: 1.0
        },
        winter: {
          foodGrowthRate: 0.6,
          herbGrowthRate: 0.4,
          energyConsumption: 1.3,
          waterConsumption: 0.8,
          mentalRecovery: 0.8
        }
      }
      this.season.effects = seasonEffects[seasonKey]
    },
    // 检查季节变化
    checkSeasonChange(day, seasonLength, currentSeasonIndex) {
      // 计算前一天的季节索引
      const previousDay = day - 1
      if (previousDay < 1) return // 游戏第一天，不检查
      const previousSeasonIndex = Math.floor((previousDay - 1) % (seasonLength * 4) / seasonLength)
      // 如果季节发生变化
      if (previousSeasonIndex !== currentSeasonIndex) {
        const seasonNames = ['春季', '夏季', '秋季', '冬季']
        this.addToEventLog(`季节已变为${seasonNames[currentSeasonIndex]}`)
        // 季节变化特殊事件
        this.triggerSeasonChangeEvent(currentSeasonIndex)
      }
    },
    // 季节变化特殊事件
    triggerSeasonChangeEvent(seasonIndex) {
      // 根据季节触发不同的特殊事件
      switch (seasonIndex) {
        case 0: // 春季开始
          if (Math.random() < 0.4) {
            const herbAmount = Math.floor(Math.random() * 5) + 3
            this.addResource('herb', herbAmount)
            this.addToEventLog(`春季到来，你发现了${herbAmount}单位新鲜草药`)
          }
          break
        case 1: // 夏季开始
          if (Math.random() < 0.4) {
            const waterAmount = Math.floor(Math.random() * 5) + 3
            this.addResource('water', waterAmount)
            this.addToEventLog(`夏季雷雨增多，你收集了${waterAmount}单位额外的水`)
          }
          break
        case 2: // 秋季开始
          if (Math.random() < 0.4) {
            const foodAmount = Math.floor(Math.random() * 8) + 5
            this.addResource('food', foodAmount)
            this.addToEventLog(`秋季丰收，你获得了${foodAmount}单位额外的食物`)
          }
          break
        case 3: // 冬季开始
          if (Math.random() < 0.4) {
            const fuelAmount = Math.floor(Math.random() * 3) + 2
            this.addResource('fuel', fuelAmount)
            this.addToEventLog(`冬季来临，你准备了${fuelAmount}单位额外的燃料`)
          }
          break
      }
    },
    // 获取资源名称
    getResourceName(resourceKey) {
      const resourceNames = {
        food: '食物',
        water: '水',
        wood: '木材',
        stone: '石头',
        metal: '金属',
        herb: '草药',
        medicine: '药品',
        tools: '工具',
        parts: '零件',
        fuel: '燃料',
        gathering: '采集',
        crafting: '制作',
        combat: '战斗',
        survival: '生存',
        research: '研究',
        predator: '野兽袭击',
        storm: '遭遇风暴',
        rockslide: '遭遇坍塌',
        radiation: '受到辐射',
        hostiles: '遭遇敌对人员',
        thirst: '消耗额外水资源',
        creatures: '遭遇奇怪的生物',
        ancientRelic: '古代遗物',
        techFragment: '科技碎片'
      }
      return resourceNames[resourceKey] || resourceKey
    },
    // 检查是否需要更新天气
    checkWeatherChange() {
      const currentDay = this.gameTime.day
      const currentHour = this.gameTime.hour
      if (currentDay > this.weather.nextChangeDay ||
        (currentDay === this.weather.nextChangeDay &&
          currentHour >= this.weather.nextChangeHour)) {
        this.generateWeather()
      }
    },
    // 生成天气
    generateWeather() {
      // 获取当前季节
      const day = this.gameTime.day
      const seasonLength = 30 // 每个季节30天
      const seasonIndex = Math.floor((day - 1) % (seasonLength * 4) / seasonLength)
      const seasons = ['spring', 'summer', 'autumn', 'winter']
      const currentSeason = seasons[seasonIndex]
      // 各季节天气概率
      const weatherProbabilities = {
        spring: {
          clear: 0.3,
          cloudy: 0.3,
          rainy: 0.25,
          foggy: 0.1,
          windy: 0.05
        },
        summer: {
          clear: 0.4,
          cloudy: 0.2,
          rainy: 0.15,
          hot: 0.15,
          storm: 0.1
        },
        autumn: {
          clear: 0.25,
          cloudy: 0.3,
          rainy: 0.2,
          foggy: 0.15,
          windy: 0.1
        },
        winter: {
          clear: 0.2,
          cloudy: 0.2,
          cold: 0.3,
          snow: 0.2,
          windy: 0.1
        }
      }

      // 获取当前季节的天气概率
      const probabilities = weatherProbabilities[currentSeason]
      // 随机选择天气
      let random = Math.random()
      let cumulativeProbability = 0
      let selectedWeather = 'clear' // 默认晴天
      for (const [weather, probability] of Object.entries(probabilities)) {
        cumulativeProbability += probability
        if (random <= cumulativeProbability) {
          selectedWeather = weather
          break
        }
      }
      // 更新天气状态
      const oldWeather = this.weather.current
      this.weather.current = selectedWeather
      // 设置天气持续时间（4-8小时）
      this.weather.duration = 4 + Math.floor(Math.random() * 5)
      // 更新下次天气变化时间
      let nextHour = this.gameTime.hour + this.weather.duration
      let nextDay = this.gameTime.day
      while (nextHour >= 24) {
        nextHour -= 24
        nextDay += 1
      }
      this.weather.nextChangeDay = nextDay
      this.weather.nextChangeHour = nextHour
      // 只有当天气变化时才记录日志
      if (oldWeather !== selectedWeather) this.addToEventLog(`天气变为${this.getWeatherName()}，${this.getWeatherEffect()}`)
      // 重置天气效果
      this.resetWeatherEffects()
    },
    // 获取天气名称
    getWeatherName() {
      const weatherNames = {
        clear: '晴朗',
        cloudy: '多云',
        rainy: '小雨',
        foggy: '雾天',
        windy: '大风',
        hot: '酷热',
        cold: '寒冷',
        snow: '降雪',
        storm: '风暴',
        heavyRain: '暴雨'
      }
      return weatherNames[this.weather.current] || '未知'
    },
    // 获取天气效果描述
    getWeatherEffect() {
      const weatherEffects = {
        clear: '视野良好，采集效率+10%',
        cloudy: '温度适宜，能量消耗-5%',
        rainy: '水资源收集+20%，移动速度-10%',
        foggy: '视野受限，探索效率-20%',
        windy: '能量消耗+10%，有机会发现特殊资源',
        hot: '水分消耗+30%，能量恢复-20%',
        cold: '食物消耗+30%，能量恢复-20%',
        snow: '移动速度-30%，采集效率-20%',
        storm: '无法外出，有触发灾害风险',
        heavyRain: '水资源收集+50%，采集效率-30%，有触发洪水风险'
      }
      return weatherEffects[this.weather.current] || ''
    },
    // 重置天气效果
    resetWeatherEffects() {
      // 重置所有效果为默认值
      this.weather.effects = {
        gatheringEfficiency: 1.0,
        energyConsumption: 1.0,
        waterConsumption: 1.0,
        foodConsumption: 1.0,
        movementSpeed: 1.0,
        explorationEfficiency: 1.0
      }
    },
    // 应用天气效果
    applyWeatherEffects() {
      // 根据当前天气应用不同效果
      switch (this.weather.current) {
        case 'clear':
          this.weather.effects.gatheringEfficiency = 1.1; // 采集效率+10%
          break;
        case 'cloudy':
          this.weather.effects.energyConsumption = 0.95; // 能量消耗-5%
          break;
        case 'rainy':
          // 下雨时随机增加水资源
          if (Math.random() < 0.2) {
            const waterAmount = Math.floor(Math.random() * 3) + 1;
            this.addResource('water', waterAmount);
          }
          this.weather.effects.movementSpeed = 0.9; // 移动速度-10%
          break;
        case 'heavyRain':
          // 暴雨时更多水资源，但有洪水风险
          if (Math.random() < 0.4) {
            const waterAmount = Math.floor(Math.random() * 5) + 2;
            this.addResource('water', waterAmount);
          }
          // 洪水风险
          if (Math.random() < 0.05) {
            this.addToEventLog('暴雨引发了洪水，你损失了一些资源！');
            // 随机损失资源
            const resources = ['food', 'wood', 'herb'];
            const randomResource = resources[Math.floor(Math.random() * resources.length)];
            const lossAmount = Math.floor(Math.random() * 5) + 1;
            this.consumeResource(randomResource, lossAmount);
          }
          this.weather.effects.gatheringEfficiency = 0.7; // 采集效率-30%
          this.weather.effects.movementSpeed = 0.7; // 移动速度-30%
          // 极端天气成就跟踪
          this.achievements.extremeWeatherSurvived = true;
          break;
        case 'foggy':
          this.weather.effects.explorationEfficiency = 0.8; // 探索效率-20%
          break;
        case 'windy':
          this.weather.effects.energyConsumption = 1.1; // 能量消耗+10%
          // 有机会发现特殊资源
          if (Math.random() < 0.1) {
            const specialResources = ['metal', 'parts', 'techFragment'];
            const randomResource = specialResources[Math.floor(Math.random() * specialResources.length)];
            this.addResource(randomResource, 1);
            this.addToEventLog(`大风带来了一些特殊资源，你获得了1单位${randomResource}！`);
          }
          break;
        case 'hot':
          this.weather.effects.waterConsumption = 1.3; // 水分消耗+30%
          // 有中暑风险
          if (Math.random() < 0.1 && this.resources.water < 5) {
            this.player.health -= 5;
            this.addToEventLog('酷热天气导致你中暑，健康下降了！');
          }
          // 极端天气成就跟踪
          this.achievements.extremeWeatherSurvived = true;
          break;
        case 'cold':
          this.weather.effects.foodConsumption = 1.3; // 食物消耗+30%
          // 有冻伤风险
          if (Math.random() < 0.1 && this.resources.food < 5) {
            this.player.health -= 5;
            this.addToEventLog('寒冷天气导致你受冻，健康下降了！');
          }
          // 极端天气成就跟踪
          this.achievements.extremeWeatherSurvived = true;
          break;
        case 'snow':
          this.weather.effects.movementSpeed = 0.7; // 移动速度-30%
          this.weather.effects.gatheringEfficiency = 0.8; // 采集效率-20%
          this.weather.effects.foodConsumption = 1.2; // 食物消耗+20%
          break;
        case 'storm':
          // 风暴天气有灾害风险
          if (Math.random() < 0.2) {
            // 检查是否有庇护所
            const hasShelter = this.buildings.some(b => b.id === 'shelter' && b.level >= 1);
            if (hasShelter) {
              this.addToEventLog('风暴肆虐，但你的庇护所提供了保护。');
              this.player.mental -= 5; // 仍有轻微影响
            } else {
              this.addToEventLog('风暴肆虐，你的健康和精神都受到了严重影响！');
              this.player.health -= 10;
              this.player.mental -= 15;
              // 随机损失资源
              const resources = ['food', 'water', 'wood', 'herb'];
              for (let i = 0; i < 2; i++) {
                const randomResource = resources[Math.floor(Math.random() * resources.length)];
                const lossAmount = Math.floor(Math.random() * 5) + 3;
                this.consumeResource(randomResource, lossAmount);
              }
            }
          }
          // 极端天气成就跟踪
          this.achievements.extremeWeatherSurvived = true;
          break;
      }
    },
    // 应用建筑效果(每天)
    applyBuildingEffectsDay() {
      // 遍历所有建筑
      for (const building of this.buildings) {
        if (!building.effects) continue;
        // 应用每日资源生产
        if (building.effects.foodPerDay) {
          this.addResource('food', building.effects.foodPerDay);
          this.addToEventLog(`${building.name}提供了${building.effects.foodPerDay}单位食物`);
        }
        if (building.effects.waterPerDay) {
          this.addResource('water', building.effects.waterPerDay);
          this.addToEventLog(`${building.name}提供了${building.effects.waterPerDay}单位水`);
        }
      }
    },
    applyBuildingEffects() {
      // 遍历所有建筑
      for (const building of this.buildings) {
        if (!building.effects) continue;
        // 应用存储上限效果
        if (building.effects.storageMultiplier) {
          for (const resource in this.resourceLimits) {
            this.resourceLimits[resource] *= building.effects.storageMultiplier;
          }
          this.addToEventLog(`${building.name}增加了资源存储上限`);
        }
        // 应用其他效果，如恢复速度等
        if (building.effects.energyRecovery) {
          this.player.energy = Math.min(this.player.energy + building.effects.energyRecovery, this.player.maxEnergy);
          this.addToEventLog(`${building.name}增加了体力恢复速度`);
        }
        if (building.effects.mentalRecovery) {
          this.player.mental = Math.min(this.player.mental + building.effects.mentalRecovery, this.player.maxMental);
          this.addToEventLog(`${building.name}增加了精神恢复速度`);
        }
        if (building.effects.maxHealth) {
          this.player.maxHealth = Math.min(this.player.maxHealth + building.effects.maxHealth, this.player.maxHealth);
          this.addToEventLog(`${building.name}增加了健康值上限`);
        }
      }
    },
    // 触发随机事件
    triggerRandomEvent() {
      // 基础事件
      const basicEvents = [
        {
          id: 'rain', name: '下雨了', effect: () => {
            this.addResource('water', 10)
            this.addToEventLog('下雨了，你收集了一些雨水')
          },
          weight: 10 // 权重，决定事件触发概率
        },
        {
          id: 'animal', name: '野生动物', effect: () => {
            if (this.skills.combat > 2) {
              this.addResource('food', 15)
              this.addToEventLog('你成功猎到了一只野兔，获得了食物')
            } else {
              this.addToEventLog('你看到一只野兔，但它跑得太快了')
            }
          },
          weight: 8
        },
        {
          id: 'stranger', name: '陌生人', effect: () => {
            this.addToEventLog('你遇到了一个陌生人，他给了你一些建议就离开了')
            this.addSkillExp('survival', 2)
          },
          weight: 6
        },
        {
          id: 'wild_fruits', name: '野果丰收', effect: () => {
            this.addResource('food', 8)
            this.addToEventLog('你发现了一片野果丛，收获了不少食物')
          },
          weight: 10
        },
        {
          id: 'herb_discovery', name: '草药发现', effect: () => {
            this.addResource('herb', 5)
            this.addToEventLog('你发现了一片罕见的草药，这对制作药品很有帮助')
          },
          weight: 7
        },
      ]
      // 危险事件
      const dangerEvents = [
        {
          id: 'storm', name: '暴风雨', effect: () => {
            // 检查是否有庇护所
            const hasShelter = this.buildings.some(b => b.id === 'shelter' && b.level >= 1)
            if (hasShelter) {
              this.addToEventLog('一场暴风雨来袭，但你的庇护所提供了良好的保护')
              this.player.mental -= 5 // 仍有轻微影响
            } else {
              this.addToEventLog('一场暴风雨来袭，你被淋得浑身湿透，精神和健康都受到了影响')
              this.player.health -= 10
              this.player.mental -= 15
            }
          },
          weight: 5,
          minDay: 3 // 最早在第3天触发
        },
        {
          id: 'illness', name: '疾病', effect: () => {
            if (this.resources.medicine > 0) {
              this.consumeResource('medicine', 1)
              this.addToEventLog('你感到身体不适，但幸好有药品治疗，很快就恢复了')
            } else {
              this.player.health -= 15
              this.player.energy -= 20
              this.addToEventLog('你生病了，没有药品治疗，健康状况恶化')
            }
          },
          weight: 4,
          minDay: 5
        },
        {
          id: 'predator', name: '掠食者', effect: () => {
            if (this.skills.combat >= 3) {
              this.addToEventLog('一只野兽袭击了你，但你成功击退了它，还获得了一些食物')
              this.addResource('food', 20)
              this.addSkillExp('combat', 2)
            } else {
              this.player.health -= 20
              this.addToEventLog('一只野兽袭击了你，你勉强逃脱，但受了伤')
            }
          },
          weight: 3,
          minDay: 7
        },
      ]

      // 幸运事件
      const luckyEvents = [
        {
          id: 'abandoned_supplies', name: '废弃物资', effect: () => {
            this.addResource('food', 10)
            this.addResource('water', 10)
            this.addResource('medicine', 1)
            this.addToEventLog('你发现了一些废弃的物资，获得了食物、水和药品')
          },
          weight: 3,
          minDay: 4
        },
        {
          id: 'tech_discovery', name: '科技发现', effect: () => {
            this.addResource('techFragment', 2)
            this.addToEventLog('你发现了一些古老的科技碎片，这对研究很有帮助')
          },
          weight: 2,
          minDay: 10
        },
        {
          id: 'ancient_cache', name: '古代宝藏', effect: () => {
            this.addResource('ancientRelic', 1)
            this.addResource('metal', 15)
            this.addResource('parts', 3)
            this.addToEventLog('你发现了一个古代文明的宝藏，获得了珍贵的资源')
          },
          weight: 1,
          minDay: 15
        },
      ]
      // 根据游戏天数选择可用事件
      let availableEvents = [...basicEvents]
      if (this.gameTime.day >= 3) availableEvents = availableEvents.concat(dangerEvents.filter(e => this.gameTime.day >= (e.minDay || 0)))
      if (this.gameTime.day >= 4) availableEvents = availableEvents.concat(luckyEvents.filter(e => this.gameTime.day >= (e.minDay || 0)))
      // 计算总权重
      const totalWeight = availableEvents.reduce((sum, event) => sum + (event.weight || 1), 0)
      // 25%概率触发随机事件
      if (Math.random() < 0.25) {
        // 根据权重随机选择事件
        let randomWeight = Math.random() * totalWeight
        let selectedEvent = null
        for (const event of availableEvents) {
          randomWeight -= (event.weight || 1)
          if (randomWeight <= 0) {
            selectedEvent = event
            break
          }
        }
        if (selectedEvent) selectedEvent.effect()
      }
    },
    // 游戏结束
    gameOver() {
      this.gameState = 'gameover'
      this.addToEventLog('你没能生存下来...')
      // 提供重生选项
      // ...
    },
    // 添加事件日志
    addToEventLog(message) {
      const timestamp = `${this.gameTime.day}天 ${this.gameTime.hour}:${this.gameTime.minute}`
      this.eventLog.unshift({ timestamp, message })
      // 限制日志长度
      if (this.eventLog.length > 100) this.eventLog.pop()
    },
  },
})