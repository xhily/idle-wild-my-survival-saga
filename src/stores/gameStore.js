import { computed } from 'vue'
import { defineStore } from 'pinia'
import { omit } from 'lodash-es'
import { encryptData, decryptData } from '../plugins/crypto'
import { recipes, availableBuildings } from '../plugins/recipes'
import { skillTree } from '../plugins/skillTree'

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
      // 生存天数
      days: 0,
      // 探索次数
      explorationCount: 0,
    },
    // 技能系统
    skillTreeEffects: {
      // 采集效果
      gatheringEfficiency: 0,
      gatheringEnergyCost: 0,
      rareHerbChance: 0,
      gatheringYield: 0,
      // 制作效果
      craftingSpeed: 0,
      resourceSaving: 0,
      extraCraftingOutput: 0,
      toolDurability: 0,
      craftingQuality: 0,
      unlockAdvancedRecipes: false,
      // 生存效果
      foodConsumption: 0,
      waterConsumption: 0,
      weatherResistance: 0,
      energyConsumption: 0,
      healthRecovery: 0,
      allSurvivalStats: 0,
      // 研究效果
      researchSpeed: 0,
      techFragmentYield: 0,
      researchResourceSaving: 0,
      unlockAdvancedTech: false,
      allResearchBonus: 0,
      breakthroughChance: 0,
      // 战斗效果
      damageBonus: 0,
      damageReduction: 0,
      criticalChance: 0,
      retreatEnergyCost: 0,
      allCombatStats: 0,
      unlockSpecialCombat: false
    },
    // 已解锁的技能
    unlockedSkills: {},
    // 季节系统
    season: {
      // 季节长度（天）
      seasonLength: 30,
      // 季节效果
      effects: {
        foodGrowthRate: 1.0,
        herbGrowthRate: 1.0,
        energyConsumption: 1.0,
        waterConsumption: 1.0
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
        energyConsumption: 1.0, // 体力消耗修正
        waterConsumption: 1.0, // 水消耗修正
        foodConsumption: 1.0, // 食物消耗修正
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
      rare_herb: 0,
      // 高级资源
      medicine: 0,
      tools: 0,
      parts: 0,
      advanced_parts: 0,
      electronic_components: 0,
      fuel: 0,
      crystal: 0,
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
      rare_herb: 30,
      medicine: 20,
      tools: 10,
      parts: 10,
      advanced_parts: 10,
      electronic_components: 10,
      crystal: 10,
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
    // 等待中的活动队列
    pendingActivities: [],
    // 游戏时间
    gameTime: {
      day: 1,
      hour: 6, // 游戏从早上6点开始
      minute: 0,
      // 时间流逝速度，实际秒:游戏分钟
      timeScale: 1, // 1秒 = 1分钟游戏时间
      // 游戏开始的时间戳
      startTime: Date.now(),
      // 当前游戏时间戳
      get timestamp() {
        return Date.now()
      }
    },
    // 已研究
    researched: [],
    recipes: [],
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
    // 任务系统
    activeQuests: [], // 进行中的任务
    completedQuests: [] // 已完成的任务
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
      this.saveGame()
      this.loadGame()
      this.addToEventLog('你醒来了，发现自己身处一片荒野...')
    },
    // 保存游戏
    saveGame() {
      const filteredState = omit(this.$state, ['eventLog', 'currentActivities', 'pendingActivities'])
      const encryptedData = encryptData(filteredState)
      if (encryptedData) {
        try {
          const encodedAppName = btoa(`+++${__APP_NAME__}`)
          localStorage.setItem(__APP_NAME__, `${encryptedData}${encodedAppName}`)
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
      const encodedAppName = btoa(`+++${__APP_NAME__}`)
      const saveData = localStorage.getItem(__APP_NAME__).replace(encodedAppName, '')
      if (saveData) {
        try {
          this.$state = decryptData(saveData)
          // 重新初始化建筑效果
          this.initBuildingEffects()
          // 重置错误的技能效果
          this.resetSkillEffects()
          this.addToEventLog('游戏已加载')
          return true
        } catch (error) {
          this.addToEventLog('数据加载失败:', error)
        }
      }
      return false
    },
    // 获取技能名称
    getSkillName(skillId) {
      const skillNames = {
        gathering: '采集',
        crafting: '制作',
        combat: '战斗',
        survival: '生存',
        research: '研究'
      }
      return skillNames[skillId] || skillId
    },
    findSkillEffectById(skillId) {
      for (const branch of Object.values(skillTree)) {
        for (const skill of branch.skills) {
          for (const [effect, value] of Object.entries(skill.effects)) {
            if (effect === skillId) {
              return {
                effects: Object.entries(skill.effects), // 获取键值对
                maxLevel: skill.maxLevel // 获取 maxLevel
              }
            }
          }
        }
      }
      return null // 如果未找到，返回 null
    },
    // 重置错误的技能效果
    resetSkillEffects() {
      for (const skillId in this.skillTreeEffects) {
        if (typeof this.skillTreeEffects[skillId] === 'number') {
          const skillData = this.findSkillEffectById(skillId)
          if (skillData) {
            const { effects, maxLevel } = skillData
            for (const [effect, value] of Object.entries(effects)) {
              if (this.skillTreeEffects[value[0]] !== undefined) {
                if (typeof value[1] === 'number') {
                  if (this.skillTreeEffects[value[0]] > (value[1] * maxLevel)) {
                    this.skillTreeEffects[value[0]] = parseFloat((value[1] * maxLevel).toFixed(2))
                  }
                }
              }
            }
          }
        }
      }
    },
    // 更新技能效果
    updateSkillEffects(skillId, effects, level) {
      // 记录已解锁的技能
      if (!this.unlockedSkills[skillId]) this.unlockedSkills[skillId] = 0
      this.unlockedSkills[skillId] = level
      // 应用效果到游戏状态
      for (const [effect, value] of Object.entries(effects)) {
        if (this.skillTreeEffects[effect] !== undefined) {
          // 对于百分比效果，根据等级累加
          if (typeof value === 'number') this.skillTreeEffects[effect] = parseFloat((this.skillTreeEffects[effect] + value).toFixed(2))
          else this.skillTreeEffects[effect] = value // 对于布尔值效果，直接设置
        }
      }
      // 立即应用生存技能效果
      if (skillId.includes('efficient_metabolism') ||
        skillId.includes('weather_adaptation') ||
        skillId.includes('energy_conservation') ||
        skillId.includes('natural_healing') ||
        skillId.includes('survival_expert')) {
        this.applySurvivalSkillEffects()
      }
    },
    // 获取技能效果修正值
    getSkillEffectModifier(effectType) {
      // 返回修正值，如果不存在则返回默认值
      const effect = this.skillTreeEffects[effectType]
      if (effect === undefined) return 0
      return effect
    },
    // 应用技能效果到资源收集
    applyGatheringSkillEffects(baseAmount, resourceType) {
      let amount = baseAmount
      // 应用采集效率加成
      if (this.skillTreeEffects.gatheringEfficiency > 0) amount *= (1 + this.skillTreeEffects.gatheringEfficiency)
      // 应用产出加成
      if (this.skillTreeEffects.gatheringYield > 0) amount *= (1 + this.skillTreeEffects.gatheringYield)
      // 对特定资源类型应用额外效果
      if (resourceType === 'herb' && this.skillTreeEffects.rareHerbChance > 0) {
        // 有几率获得稀有草药
        if (Math.random() < this.skillTreeEffects.rareHerbChance) {
          this.addResource('rare_herb', 1)
          this.addToEventLog('你的技能帮助你发现了一株稀有草药！')
        }
      }
      return Math.floor(amount)
    },
    // 添加资源
    addResource(resource, amount) {
      if (!this.resources.hasOwnProperty(resource)) return false
      // 确保不超过上限
      const newAmount = this.resources[resource] + amount
      this.resources[resource] = Math.min(newAmount, this.resourceLimits[resource])
      return true
    },
    // 任务系统相关方法
    // 接受任务
    acceptQuest(quest) {
      // 检查任务是否已经在进行中
      if (this.activeQuests.some(q => q.id === quest.id)) {
        this.addToEventLog(`任务 ${quest.name} 已经在进行中`)
        return false
      }
      // 检查任务是否已经完成
      if (this.completedQuests.some(q => q.id === quest.id)) {
        this.addToEventLog(`任务 ${quest.name} 已经完成`)
        return false
      }
      // 添加任务到进行中列表
      this.activeQuests.push(quest)
      this.addToEventLog(`接受了任务: ${quest.name}`)
      return true
    },
    // 完成任务
    completeQuest(quest) {
      // 查找任务在进行中列表的索引
      const questIndex = this.activeQuests.findIndex(q => q.id === quest.id)
      if (questIndex === -1) {
        this.addToEventLog(`任务 ${quest.name} 不在进行中`)
        return false
      }
      // 从进行中列表移除任务
      const completedQuest = this.activeQuests.splice(questIndex, 1)[0]
      // 添加到已完成列表
      this.completedQuests.push(completedQuest)
      // 发放奖励
      this.giveQuestRewards(completedQuest)
      this.addToEventLog(`完成了任务: ${completedQuest.name}`)
      return true
    },
    // 放弃任务
    abandonQuest(quest) {
      // 查找任务在进行中列表的索引
      const questIndex = this.activeQuests.findIndex(q => q.id === quest.id)
      if (questIndex === -1) {
        this.addToEventLog(`任务 ${quest.name} 不在进行中`)
        return false
      }
      // 从进行中列表移除任务
      this.activeQuests.splice(questIndex, 1)
      this.addToEventLog(`放弃了任务: ${quest.name}`)
      return true
    },
    // 发放任务奖励
    giveQuestRewards(quest) {
      if (!quest.rewards) return
      // 处理各种类型的奖励
      for (const [rewardType, amount] of Object.entries(quest.rewards)) {
        switch (rewardType) {
          case 'exp':
            // 增加经验值
            this.player.exp += amount
            this.checkLevelUp()
            break
          case 'maxHealth':
            // 增加最大健康
            this.player.maxHealth += amount
            this.player.health += amount
            break
          case 'maxEnergy':
            // 增加最大体力
            this.player.maxEnergy += amount
            this.player.energy += amount
            break
          default:
            // 如果是资源类型的奖励
            if (this.resources.hasOwnProperty(rewardType)) this.addResource(rewardType, amount)
            break
        }
      }
    },
    // 检查玩家是否可以升级
    checkLevelUp() {
      while (this.player.exp >= this.player.expToNextLevel) {
        this.player.exp -= this.player.expToNextLevel
        this.player.level += 1
        // 增加下一级所需经验
        this.player.expToNextLevel = Math.floor(this.player.expToNextLevel * 1.5)
        // 升级奖励
        this.player.maxHealth += 5
        this.player.health = this.player.maxHealth
        this.player.maxEnergy += 5
        this.player.energy = this.player.maxEnergy
        this.addToEventLog(`升级了！当前等级: ${this.player.level}`)
      }
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
      const recipe = recipes.find(r => r.id === recipeId)
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
          let energyAmount = amount
          if (recipe.category === 'gathering' && this.skillTreeEffects.gatheringEnergyCost < 0) energyAmount = Math.floor(energyAmount * (1 + this.skillTreeEffects.gatheringEnergyCost))
          if (this.skillTreeEffects.energyConsumption < 0) energyAmount = Math.floor(energyAmount * (1 + this.skillTreeEffects.energyConsumption))
          energyAmount = Math.max(1, energyAmount)
          if (this.player.energy < energyAmount) {
            this.addToEventLog('你的体力不足')
            return false
          }
          this.player.energy -= energyAmount
        } else {
          if (!this.consumeResource(resource, amount)) {
            this.addToEventLog(`资源不足: ${this.getResourceName(resource)}`)
            return false
          }
        }
      }
      // 计算活动持续时间
      let activityDuration = recipe.duration
      if (recipe.category === 'gathering' && this.skillTreeEffects.gatheringEfficiency > 0) {
        activityDuration = Math.floor(activityDuration / (1 + this.skillTreeEffects.gatheringEfficiency))
      }
      if (recipe.category === 'crafting' && this.skillTreeEffects.craftingSpeed > 0) {
        activityDuration = Math.floor(activityDuration / (1 + this.skillTreeEffects.craftingSpeed))
      }
      activityDuration = Math.max(1, activityDuration)
      const activity = {
        id: Date.now(),
        recipeId,
        name: recipe.name,
        duration: activityDuration * 1000,
        completed: false
      }
      const research = this.currentActivities.some(a => a.recipeId.startsWith('research_'))
      const explore = this.currentActivities.some(a => a.recipeId.startsWith('explore_'))
      const gathering = this.currentActivities.filter(a => a.recipeId.startsWith('gather_')).length
      const crafting = this.currentActivities.filter(a => a.recipeId.startsWith('craft_')).length
      // 如果没有正在进行的活动，立即开始
      if ((!research || !explore) && gathering < this.player.level && crafting < this.player.level) {
        activity.startTime = Date.now()
        this.currentActivities.push(activity)
        this.startActivityTimer(activity)
        this.addToEventLog(`开始${recipe.name}`)
      } else {
        // 否则加入等待队列
        this.pendingActivities.push(activity)
        this.addToEventLog(`已将${recipe.name}加入等待队列`)
      }
      return true
    },
    // 启动活动计时器
    startActivityTimer(activity) {
      activity.timer = setTimeout(() => {
        this.completeActivity(activity.id)
        // 检查是否有等待中的活动
        if (this.pendingActivities.length > 0) {
          const nextActivity = this.pendingActivities.shift()
          nextActivity.startTime = Date.now()
          this.currentActivities.push(nextActivity)
          this.startActivityTimer(nextActivity)
          this.addToEventLog(`开始${nextActivity.name}`)
        }
      }, activity.duration)
    },
    // 取消活动
    cancelActivity(activityId) {
      // 先检查当前活动
      const currentIndex = this.currentActivities.findIndex(a => a.id === activityId)
      if (currentIndex !== -1) {
        const activity = this.currentActivities[currentIndex]
        const recipe = recipes.find(r => r.id === activity.recipeId)
        // 返还资源
        if (recipe) {
          // 返还体力
          if (recipe.inputs.energy) {
            let energyAmount = recipe.inputs.energy
            if (recipe.category === 'gathering' && this.skillTreeEffects.gatheringEnergyCost < 0)
              energyAmount = Math.floor(energyAmount * (1 + this.skillTreeEffects.gatheringEnergyCost))
            if (this.skillTreeEffects.energyConsumption < 0)
              energyAmount = Math.floor(energyAmount * (1 + this.skillTreeEffects.energyConsumption))
            energyAmount = Math.max(1, energyAmount)
            this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + energyAmount)
          }
          // 返还其他资源
          for (const [resource, amount] of Object.entries(recipe.inputs)) {
            if (resource !== 'energy') {
              this.addResource(resource, amount)
            }
          }
        }
        // 移除活动
        if (activity.timer) clearTimeout(activity.timer)
        this.currentActivities.splice(currentIndex, 1)
        this.addToEventLog(`取消了${activity.name}活动并返还了资源`)
        // 检查并启动等待队列中的下一个活动
        if (this.pendingActivities.length > 0) {
          const nextActivity = this.pendingActivities.shift()
          nextActivity.startTime = Date.now()
          this.currentActivities.push(nextActivity)
          this.startActivityTimer(nextActivity)
          this.addToEventLog(`开始${nextActivity.name}`)
        }
        return true
      }
      // 检查等待队列
      const pendingIndex = this.pendingActivities.findIndex(a => a.id === activityId)
      if (pendingIndex !== -1) {
        const activity = this.pendingActivities[pendingIndex]
        const recipe = recipes.find(r => r.id === activity.recipeId)
        // 返还资源
        if (recipe) {
          // 返还体力
          if (recipe.inputs.energy) {
            let energyAmount = recipe.inputs.energy
            if (recipe.category === 'gathering' && this.skillTreeEffects.gatheringEnergyCost < 0)
              energyAmount = Math.floor(energyAmount * (1 + this.skillTreeEffects.gatheringEnergyCost))
            if (this.skillTreeEffects.energyConsumption < 0)
              energyAmount = Math.floor(energyAmount * (1 + this.skillTreeEffects.energyConsumption))
            energyAmount = Math.max(1, energyAmount)
            this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + energyAmount)
          }
          // 返还其他资源
          for (const [resource, amount] of Object.entries(recipe.inputs)) {
            if (resource !== 'energy') {
              this.addResource(resource, amount)
            }
          }
        }
        this.pendingActivities.splice(pendingIndex, 1)
        this.addToEventLog(`取消了等待中的${activity.name}活动并返还了资源`)
        return true
      }
      return false
    },
    // 完成活动
    completeActivity(activityId) {
      const activityIndex = this.currentActivities.findIndex(a => a.id === activityId)
      if (activityIndex === -1) return false
      const activity = this.currentActivities[activityIndex]
      const recipe = recipes.find(r => r.id === activity.recipeId)
      // 清除定时器
      if (activity.timer) clearTimeout(activity.timer)
      // 移除活动
      this.currentActivities.splice(activityIndex, 1)
      // 应用技能效果到输出资源
      let modifiedOutputs = {}
      // 添加输出资源
      for (const [resource, output] of Object.entries(recipe.outputs)) {
        let amount
        // 处理不同类型的输出格式
        if (Array.isArray(output)) {
          // 如果是[min, max]范围
          const [min, max] = output
          amount = Math.floor(Math.random() * (max - min + 1)) + min
        } else if (typeof output === 'number') {
          // 如果是固定数量
          amount = output
        } else {
          // 其他格式跳过
          continue
        }
        // 应用技能效果
        if (recipe.category === 'gathering') amount = this.applyGatheringSkillEffects(amount, resource) // 应用采集技能效果
        else if (recipe.category === 'crafting') modifiedOutputs[resource] = amount // 对于制作活动，先收集所有输出，稍后应用技能效果
        else if (recipe.category === 'research' && resource === 'techFragment') amount = this.applyResearchSkillEffects(amount) // 应用研究技能效果
        // 如果不是制作活动，直接添加资源
        if (recipe.category !== 'crafting') {
          this.addResource(resource, amount)
          this.addToEventLog(`获得 ${amount} ${this.getResourceName(resource)}`)
          // 更新成就系统的资源收集计数
          if (this.achievements.resourcesCollected.hasOwnProperty(resource)) this.achievements.resourcesCollected[resource] += amount
        }
      }
      // 对制作活动应用技能效果并添加资源
      if (recipe.category === 'crafting' && Object.keys(modifiedOutputs).length > 0) {
        // 应用制作技能效果
        const finalOutputs = this.applyCraftingSkillEffects(recipe, modifiedOutputs)
        // 添加最终资源
        for (const [resource, amount] of Object.entries(finalOutputs)) {
          this.addResource(resource, amount)
          this.addToEventLog(`获得 ${amount} ${this.getResourceName(resource)}`)
          // 更新成就系统的资源收集计数
          if (this.achievements.resourcesCollected.hasOwnProperty(resource)) this.achievements.resourcesCollected[resource] += amount
        }
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
              this.addToEventLog('你的采集技能提高，增加了最大体力！')
              break
            case 'crafting':
              // 解锁新的制作配方
              this.addToEventLog('你的制作技能提高，可以制作更复杂的物品了！')
              break
            case 'combat':
              this.player.maxHealth += 10
              this.player.health += 10
              this.addToEventLog('你的战斗技能提高，增加了最大健康！')
              break
            case 'survival':
              // 提高资源上限
              for (const key in this.resourceLimits) {
                this.resourceLimits[key] *= 1.1
              }
              this.addToEventLog('你的生存技能提高，可以储存更多资源了！')
              break
          }
        }
      }
      return true
    },
    // 应用技能效果到制作活动
    applyCraftingSkillEffects(recipe, outputs) {
      let modifiedOutputs = { ...outputs }
      // 应用制作质量加成
      if (this.skillTreeEffects.craftingQuality > 0) {
        // 对于数值型输出，增加产量
        for (const [resource, amount] of Object.entries(modifiedOutputs)) {
          if (typeof amount === 'number') modifiedOutputs[resource] = Math.floor(amount * (1 + this.skillTreeEffects.craftingQuality))
        }
      }
      // 应用额外产出几率
      if (this.skillTreeEffects.extraCraftingOutput > 0 && Math.random() < this.skillTreeEffects.extraCraftingOutput) {
        // 随机选择一种资源增加产量
        const resources = Object.keys(modifiedOutputs)
        if (resources.length > 0) {
          const resource = resources[Math.floor(Math.random() * resources.length)]
          if (typeof modifiedOutputs[resource] === 'number') {
            modifiedOutputs[resource] += 1
            this.addToEventLog(`你的制作技能帮助你获得了额外的 ${this.getResourceName(resource)}！`)
          }
        }
      }
      return modifiedOutputs
    },
    // 应用技能效果到研究活动
    applyResearchSkillEffects(techFragment) {
      let amount = techFragment
      // 应用研究加成
      if (this.skillTreeEffects.techFragmentYield > 0) amount = Math.floor(amount * (1 + this.skillTreeEffects.techFragmentYield))
      // 应用突破性发现几率
      if (this.skillTreeEffects.breakthroughChance > 0 && Math.random() < this.skillTreeEffects.breakthroughChance) {
        amount += 1
        this.addToEventLog('你取得了突破性的研究发现！')
      }
      return amount
    },
    // 应用技能效果到生存属性
    applySurvivalSkillEffects() {
      // 应用最大健康加成
      if (this.skillTreeEffects.maxHealth > 0) {
        const healthBonus = Math.floor(this.player.maxHealth * this.skillTreeEffects.maxHealth)
        this.player.maxHealth += healthBonus
      }
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
      this.applyWeatherEffects()
      // 消耗基本资源（考虑天气和技能影响）
      let waterConsumptionRate = 1 * this.weather.effects.waterConsumption
      let foodConsumptionRate = 1 * this.weather.effects.foodConsumption
      // 应用技能效果 - 水和食物消耗减少
      if (this.skillTreeEffects.waterConsumption < 0) waterConsumptionRate *= (1 + this.skillTreeEffects.waterConsumption) // 负值表示减少消耗
      if (this.skillTreeEffects.foodConsumption < 0) foodConsumptionRate *= (1 + this.skillTreeEffects.foodConsumption) // 负值表示减少消耗
      const waterConsumption = Math.max(1, Math.ceil(waterConsumptionRate)) // 至少消耗1点
      const foodConsumption = Math.max(1, Math.ceil(foodConsumptionRate)) // 至少消耗1点
      this.consumeResource('water', waterConsumption)
      this.consumeResource('food', foodConsumption)
      // 应用建筑的小时效果
      this.applyBuildingEffectsHourly()
      // 根据时间段自然恢复体力
      let baseEnergyRecovery = 0
      // 夜间休息恢复更多体力
      baseEnergyRecovery = this.gameTime.hour >= 22 || this.gameTime.hour <= 6 ? 5 : 1
      // 应用天气对体力恢复的影响
      if (this.weather.current === 'hot' || this.weather.current === 'cold') baseEnergyRecovery *= 0.8 // 极端天气减少体力恢复
      // 应用基础体力恢复
      this.player.energy = Math.min(this.player.energy + baseEnergyRecovery, this.player.maxEnergy)
      // 应用技能中的健康恢复效果
      if (this.skillTreeEffects.healthRecovery > 0) {
        const healthRecovery = Math.floor(this.player.maxHealth * 0.01 * this.skillTreeEffects.healthRecovery)
        this.player.health = Math.min(this.player.health + healthRecovery, this.player.maxHealth)
      }
      // 检查资源状态并影响健康
      if (this.resources.food <= 0 || this.resources.water <= 0) {
        // 极端天气下，缺乏资源的影响更严重
        let healthPenalty = 5
        if (['hot', 'cold', 'storm'].includes(this.weather.current)) {
          healthPenalty = 8
          this.addToEventLog(`在${this.getWeatherName()}天气下，缺乏基本资源使你的健康迅速恶化！`)
        } else {
          this.addToEventLog('你感到饥饿和口渴，健康下降了')
        }
        this.player.health -= healthPenalty
      }
      // 检查游戏结束条件
      if (this.player.health <= 0) this.gameOver()
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
      if (this.player.health >= (this.player.health * 0.9)) {
        this.achievements.healthyDays += 1
      } else {
        this.achievements.healthyDays = 0 // 重置连续健康天数
      }
      this.addToEventLog(`第${this.gameTime.day}天开始了`)
      // 自动保存
      if (this.settings.autoSave) this.saveGame()
    },
    // 建造新建筑
    buildNewBuilding(buildingId, level) {
      // 查找建筑配置
      const buildingConfig = availableBuildings.find(b => b.id === buildingId)
      if (!buildingConfig) {
        this.addToEventLog(`未找到建筑: ${buildingId}`)
        return false
      }
      // 获取指定等级的配置
      const levelConfig = buildingConfig.levels.find(l => l.level === level)
      if (!levelConfig) {
        this.addToEventLog(`未找到建筑等级配置: ${buildingId} 等级 ${level}`)
        return false
      }
      // 检查技能要求
      for (const [skill, requiredLevel] of Object.entries(levelConfig.requirements)) {
        if (this.skills[skill] < requiredLevel) {
          this.addToEventLog(`你的${skill}技能等级不足，需要达到${requiredLevel}级`)
          return false
        }
      }
      // 检查并消耗资源
      for (const [resource, amount] of Object.entries(levelConfig.cost)) {
        if (!this.consumeResource(resource, amount)) {
          this.addToEventLog(`资源不足: ${this.getResourceName(resource)}`)
          return false
        }
      }
      // 检查是否已有该建筑
      const existingBuildingIndex = this.buildings.findIndex(b => b.id === buildingId)
      if (existingBuildingIndex !== -1) {
        // 已有建筑，检查是否可以升级
        const existingBuilding = this.buildings[existingBuildingIndex]
        if (existingBuilding.level >= level) {
          this.addToEventLog(`${buildingConfig.name}已经是等级${existingBuilding.level}，无需重复建造`)
          return false
        }
        // 升级建筑
        this.buildings[existingBuildingIndex] = {
          id: buildingId,
          name: buildingConfig.name,
          level: level,
          effects: { ...levelConfig.effects }
        }
        this.addToEventLog(`${buildingConfig.name}已升级到等级${level}`)
      } else {
        // 新建建筑
        this.buildings.push({
          id: buildingId,
          name: buildingConfig.name,
          level: level,
          effects: { ...levelConfig.effects }
        })
        this.addToEventLog(`建造了${buildingConfig.name}(等级${level})`)
      }
      // 重新初始化建筑效果
      this.initBuildingEffects()
      return true
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
          // 冬季健康状态可能下降
          if (Math.random() < 0.2 && this.player.health > 10) {
            this.player.health -= 2
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
          waterConsumption: 1.0
        },
        summer: {
          foodGrowthRate: 1.0,
          herbGrowthRate: 0.8,
          energyConsumption: 1.2,
          waterConsumption: 1.3
        },
        autumn: {
          foodGrowthRate: 1.4,
          herbGrowthRate: 0.7,
          energyConsumption: 1.0,
          waterConsumption: 0.9
        },
        winter: {
          foodGrowthRate: 0.6,
          herbGrowthRate: 0.4,
          energyConsumption: 1.3,
          waterConsumption: 0.8
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
        exp: '幸存者经验',
        maxHealth: '最大健康',
        maxEnergy: '最大体力',
        health: '健康',
        energy: '体力',
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
        techFragment: '科技碎片',
        advanced_parts: '高级零件',
        electronic_components: '电子元件',
        rare_herb: '稀有草药',
        crystal: '水晶',
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
    // 获取天气对建筑效果的影响
    getWeatherBuildingMultiplier() {
      // 不同天气对建筑效果的影响
      const weatherEffects = {
        clear: { production: 1.2, waterCollection: 0.8, protection: 1.0 },
        cloudy: { production: 1.0, waterCollection: 1.0, protection: 1.0 },
        rainy: { production: 0.9, waterCollection: 1.5, protection: 0.9 },
        foggy: { production: 0.8, waterCollection: 1.0, protection: 0.8 },
        windy: { production: 0.9, waterCollection: 1.2, protection: 0.7 },
        hot: { production: 0.8, waterCollection: 0.5, protection: 0.8 },
        cold: { production: 0.7, waterCollection: 0.7, protection: 0.7 },
        snow: { production: 0.6, waterCollection: 0.6, protection: 0.6 },
        storm: { production: 0.5, waterCollection: 1.8, protection: 0.5 },
        heavyRain: { production: 0.7, waterCollection: 2.0, protection: 0.7 }
      }
      return weatherEffects[this.weather.current] || { production: 1.0, waterCollection: 1.0, protection: 1.0 }
    },
    // 获取天气效果描述
    getWeatherEffect() {
      const weatherEffects = {
        clear: '视野良好，采集效率+10%',
        cloudy: '温度适宜，体力消耗-5%',
        rainy: '水资源收集+20%，移动速度-10%',
        foggy: '视野受限，探索效率-20%',
        windy: '体力消耗+10%，有机会发现特殊资源',
        hot: '水分消耗+30%，体力恢复-20%',
        cold: '食物消耗+30%，体力恢复-20%',
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
        explorationEfficiency: 1.0
      }
    },
    // 应用天气效果
    applyWeatherEffects() {
      // 根据当前天气应用不同效果
      switch (this.weather.current) {
        case 'clear':
          this.weather.effects.gatheringEfficiency = 1.1 // 采集效率+10%
          break
        case 'cloudy':
          this.weather.effects.energyConsumption = 0.95 // 体力消耗-5%
          break
        case 'rainy':
          // 下雨时随机增加水资源
          if (Math.random() < 0.2) {
            const waterAmount = Math.floor(Math.random() * 3) + 1
            this.addResource('water', waterAmount)
          }
          break
        case 'heavyRain':
          // 暴雨时更多水资源，但有洪水风险
          if (Math.random() < 0.4) {
            const waterAmount = Math.floor(Math.random() * 5) + 2
            this.addResource('water', waterAmount)
          }
          // 洪水风险
          if (Math.random() < 0.05) {
            this.addToEventLog('暴雨引发了洪水，你损失了一些资源！')
            // 随机损失资源
            const resources = ['food', 'wood', 'herb']
            const randomResource = resources[Math.floor(Math.random() * resources.length)]
            const lossAmount = Math.floor(Math.random() * 5) + 1
            this.consumeResource(randomResource, lossAmount)
          }
          this.weather.effects.gatheringEfficiency = 0.7 // 采集效率-30%
          // 极端天气成就跟踪
          this.achievements.extremeWeatherSurvived = true
          break
        case 'foggy':
          this.weather.effects.explorationEfficiency = 0.8 // 探索效率-20%
          break
        case 'windy':
          this.weather.effects.energyConsumption = 1.1 // 体力消耗+10%
          // 有机会发现特殊资源
          if (Math.random() < 0.1) {
            const specialResources = ['metal', 'parts', 'techFragment']
            const randomResource = specialResources[Math.floor(Math.random() * specialResources.length)]
            this.addResource(randomResource, 1)
            this.addToEventLog(`大风带来了一些特殊资源，你获得了1单位${randomResource}！`)
          }
          break
        case 'hot':
          this.weather.effects.waterConsumption = 1.3 // 水分消耗+30%
          // 有中暑风险
          if (Math.random() < 0.1 && this.resources.water < 5) {
            this.player.health -= 5
            this.addToEventLog('酷热天气导致你中暑，健康下降了！')
          }
          // 极端天气成就跟踪
          this.achievements.extremeWeatherSurvived = true
          break
        case 'cold':
          this.weather.effects.foodConsumption = 1.3 // 食物消耗+30%
          // 有冻伤风险
          if (Math.random() < 0.1 && this.resources.food < 5) {
            this.player.health -= 5
            this.addToEventLog('寒冷天气导致你受冻，健康下降了！')
          }
          // 极端天气成就跟踪
          this.achievements.extremeWeatherSurvived = true
          break
        case 'snow':
          this.weather.effects.gatheringEfficiency = 0.8 // 采集效率-20%
          this.weather.effects.foodConsumption = 1.2 // 食物消耗+20%
          break
        case 'storm':
          // 风暴天气有灾害风险

          // 应用技能中的天气抵抗效果
          if (this.skillTreeEffects.weatherResistance > 0) {
            // 减轻负面天气效果
            const resistance = this.skillTreeEffects.weatherResistance
            // 只有当天气效果是负面的时候才应用抵抗
            if (this.weather.effects.gatheringEfficiency < 1.0) {
              this.weather.effects.gatheringEfficiency = Math.min(1.0,
                this.weather.effects.gatheringEfficiency * (1 + resistance))
            }
            if (this.weather.effects.energyConsumption > 1.0) {
              this.weather.effects.energyConsumption = Math.max(1.0,
                this.weather.effects.energyConsumption / (1 + resistance))
            }
            if (this.weather.effects.waterConsumption > 1.0) {
              this.weather.effects.waterConsumption = Math.max(1.0,
                this.weather.effects.waterConsumption / (1 + resistance))
            }
            if (this.weather.effects.foodConsumption > 1.0) {
              this.weather.effects.foodConsumption = Math.max(1.0,
                this.weather.effects.foodConsumption / (1 + resistance))
            }
            if (this.weather.effects.explorationEfficiency < 1.0) {
              this.weather.effects.explorationEfficiency = Math.min(1.0,
                this.weather.effects.explorationEfficiency * (1 + resistance))
            }
          }
          if (Math.random() < 0.2) {
            // 检查是否有庇护所
            const hasShelter = this.buildings.some(b => b.id === 'shelter' && b.level >= 1)
            if (hasShelter) {
              this.addToEventLog('风暴肆虐，但你的庇护所提供了保护。')
              this.player.health -= 5 // 仍有轻微影响
            } else {
              this.addToEventLog('风暴肆虐，你的健康都受到了严重影响！')
              this.player.health -= 10
              // 随机损失资源
              const resources = ['food', 'water', 'wood', 'herb']
              for (let i = 0; i < 2; i++) {
                const randomResource = resources[Math.floor(Math.random() * resources.length)]
                const lossAmount = Math.floor(Math.random() * 5) + 3
                this.consumeResource(randomResource, lossAmount)
              }
            }
          }
          // 极端天气成就跟踪
          this.achievements.extremeWeatherSurvived = true
          break
      }
    },
    // 应用建筑效果(每天)
    applyBuildingEffectsDay() {
      // 获取季节对建筑生产的影响
      const seasonMultiplier = this.calculateSeasonBuildingMultiplier()
      // 获取天气对建筑生产的影响
      const weatherMultiplier = this.getWeatherBuildingMultiplier()
      // 遍历所有建筑
      for (const building of this.buildings) {
        if (!building.effects) continue
        // 应用每日资源生产（考虑季节和天气影响）
        if (building.effects.foodPerDay) {
          const amount = Math.ceil(building.effects.foodPerDay * seasonMultiplier.production * weatherMultiplier.production)
          this.addResource('food', amount)
          this.addToEventLog(`${building.name}提供了${amount}单位食物`)
        }
        if (building.effects.waterPerDay) {
          const amount = Math.ceil(building.effects.waterPerDay * weatherMultiplier.waterCollection)
          this.addResource('water', amount)
          this.addToEventLog(`${building.name}提供了${amount}单位水`)
        }
        // 应用其他资源生产
        if (building.effects.woodPerDay) {
          const amount = Math.ceil(building.effects.woodPerDay * seasonMultiplier.production)
          this.addResource('wood', amount)
          this.addToEventLog(`${building.name}提供了${amount}单位木材`)
        }
        if (building.effects.stonePerDay) {
          const amount = Math.ceil(building.effects.stonePerDay * seasonMultiplier.production)
          this.addResource('stone', amount)
          this.addToEventLog(`${building.name}提供了${amount}单位石头`)
        }
        if (building.effects.metalPerDay) {
          const amount = Math.ceil(building.effects.metalPerDay * seasonMultiplier.production)
          this.addResource('metal', amount)
          this.addToEventLog(`${building.name}提供了${amount}单位金属`)
        }
        if (building.effects.herbPerDay) {
          const amount = Math.ceil(building.effects.herbPerDay * seasonMultiplier.production)
          this.addResource('herb', amount)
          this.addToEventLog(`${building.name}提供了${amount}单位草药`)
        }
        // 高级资源生产
        if (building.effects.medicinePerDay) {
          this.addResource('medicine', building.effects.medicinePerDay)
          this.addToEventLog(`${building.name}提供了${building.effects.medicinePerDay}单位药品`)
        }
        if (building.effects.toolsPerDay) {
          this.addResource('tools', building.effects.toolsPerDay)
          this.addToEventLog(`${building.name}提供了${building.effects.toolsPerDay}单位工具`)
        }
        if (building.effects.partsPerDay) {
          this.addResource('parts', building.effects.partsPerDay)
          this.addToEventLog(`${building.name}提供了${building.effects.partsPerDay}单位零件`)
        }
        if (building.effects.fuelPerDay) {
          this.addResource('fuel', building.effects.fuelPerDay)
          this.addToEventLog(`${building.name}提供了${building.effects.fuelPerDay}单位燃料`)
        }
      }
    },
    // 初始化建筑效果（在建造或加载游戏时调用）
    initBuildingEffects() {
      // 遍历所有建筑应用永久效果
      for (const building of this.buildings) {
        if (!building.effects) continue
        // 应用存储上限效果
        if (building.effects.storageMultiplier) {
          for (const resource in this.resourceLimits) {
            if (this.resourceLimits[resource] >= 200) continue
            this.resourceLimits[resource] *= building.effects.storageMultiplier
          }
        }
        // 应用最大健康效果
        if (building.effects.maxHealth) this.player.maxHealth += building.effects.maxHealth
        // 应用最大体力效果
        if (building.effects.maxEnergy) this.player.maxEnergy += building.effects.maxEnergy
      }
    },
    // 重置资源上限到基础值
    resetResourceLimits() {
      const resourceLimits = {
        food: 50,
        water: 50,
        wood: 50,
        stone: 50,
        metal: 50,
        herb: 30,
        rare_herb: 30,
        medicine: 20,
        tools: 10,
        parts: 10,
        advanced_parts: 10,
        electronic_components: 10,
        crystal: 10,
        fuel: 20,
        ancientRelic: 5,
        techFragment: 5,
      }
      const resources = {
        food: 10,
        water: 10,
        wood: 0,
        stone: 0,
        metal: 0,
        herb: 0,
        rare_herb: 0,
        // 高级资源
        medicine: 0,
        tools: 0,
        parts: 0,
        advanced_parts: 0,
        electronic_components: 0,
        fuel: 0,
        crystal: 0,
        // 特殊资源
        ancientRelic: 0,
        techFragment: 0,
      }
      for (const resource in resourceLimits) {
        // 资源
        if (typeof this.resources[resource] !== 'number') {
          this.resources[resource] = resources[resource]
        }
        // 资源上限
        if (typeof this.resourceLimits[resource] !== 'number') {
          this.resourceLimits[resource] = resourceLimits[resource]
        } else if (this.resourceLimits[resource] >= 200) {
          this.resourceLimits[resource] = 200
        }
      }
    },
    // 应用建筑的小时效果（在hourlyUpdate中调用）
    applyBuildingEffectsHourly() {
      // 计算季节对建筑效果的影响
      const seasonMultiplier = this.calculateSeasonBuildingMultiplier()
      // 遍历所有建筑
      for (const building of this.buildings) {
        if (!building.effects) continue
        // 应用体力恢复效果（考虑季节影响）
        if (building.effects.energyRecovery) {
          const recovery = building.effects.energyRecovery * seasonMultiplier.energy
          this.player.energy = Math.min(this.player.energy + recovery, this.player.maxEnergy)
        }
        // 应用健康恢复效果
        if (building.effects.healthRecovery) {
          const recovery = building.effects.healthRecovery * seasonMultiplier.health
          this.player.health = Math.min(this.player.health + recovery, this.player.maxHealth)
        }
      }
    },
    // 计算季节对建筑效果的影响
    calculateSeasonBuildingMultiplier() {
      const day = this.gameTime.day
      const seasonLength = this.season.seasonLength
      const seasonIndex = Math.floor((day - 1) % (seasonLength * 4) / seasonLength)
      // 季节对建筑效果的影响
      const seasonMultipliers = [
        // 春季 - 适中
        { energy: 1.1, health: 1.1, production: 1.2 },
        // 夏季 - 体力消耗高，生产高
        { energy: 0.9, health: 1.0, production: 1.3 },
        // 秋季 - 生产最高
        { energy: 1.0, health: 1.0, production: 1.4 },
        // 冬季 - 各方面都受限
        { energy: 0.8, health: 0.9, production: 0.7 }
      ]
      return seasonMultipliers[seasonIndex]
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
              this.player.health -= 5 // 仍有轻微影响
            } else {
              this.addToEventLog('一场暴风雨来袭，你被淋得浑身湿透，健康都受到了影响')
              this.player.health -= 10
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