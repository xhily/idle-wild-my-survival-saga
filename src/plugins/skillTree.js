export const skillTree = {
  // 采集技能
  gathering: {
    name: '采集',
    icon: '🌿',
    description: '提高资源采集效率和发现稀有资源的几率',
    skills: [
      {
        id: 'efficient_gathering',
        name: '高效采集',
        description: '提高基础资源采集效率15%',
        level: 1,
        maxLevel: 3,
        effects: { gatheringEfficiency: 0.15 },
        cost: { exp: 20 },
        requires: null
      },
      {
        id: 'resource_detection',
        name: '资源探测',
        description: '增加10%发现稀有资源的几率',
        level: 0,
        maxLevel: 3,
        effects: { rareResourceChance: 0.1 },
        cost: { exp: 30 },
        requires: { gathering: 2 }
      },
      {
        id: 'conservation',
        name: '资源保存',
        description: '采集活动消耗的体力减少10%',
        level: 0,
        maxLevel: 2,
        effects: { gatheringEnergyCost: -0.1 },
        cost: { exp: 40 },
        requires: { gathering: 3 }
      },
      {
        id: 'rare_herb_finding',
        name: '稀有草药寻觅',
        description: '采集草药时有15%几率额外获得稀有草药',
        level: 0,
        maxLevel: 2,
        effects: { rareHerbChance: 0.15 },
        cost: { exp: 50 },
        requires: { gathering: 4, skills: { resource_detection: 1 } }
      },
      {
        id: 'master_gatherer',
        name: '采集大师',
        description: '所有采集活动产出增加25%',
        level: 0,
        maxLevel: 1,
        effects: { gatheringYield: 0.25 },
        cost: { exp: 100 },
        requires: { gathering: 5, skills: { efficient_gathering: 2, conservation: 1 } }
      }
    ]
  },
  // 制作技能
  crafting: {
    name: '制作',
    icon: '🔨',
    description: '提高物品制作效率和质量',
    skills: [
      {
        id: 'efficient_crafting',
        name: '高效制作',
        description: '制作物品时间减少15%',
        level: 0,
        maxLevel: 3,
        effects: { craftingSpeed: 0.15 },
        cost: { exp: 20 },
        requires: null
      },
      {
        id: 'resource_saving',
        name: '资源节约',
        description: '制作物品时有10%几率不消耗部分材料',
        level: 0,
        maxLevel: 3,
        effects: { resourceSaving: 0.1 },
        cost: { exp: 30 },
        requires: { crafting: 2 }
      },
      {
        id: 'quality_crafting',
        name: '精良制作',
        description: '制作物品时有15%几率获得额外产出',
        level: 0,
        maxLevel: 2,
        effects: { extraCraftingOutput: 0.15 },
        cost: { exp: 45 },
        requires: { crafting: 3 }
      },
      {
        id: 'tool_specialist',
        name: '工具专家',
        description: '制作工具时耐久度增加20%',
        level: 0,
        maxLevel: 2,
        effects: { toolDurability: 0.2 },
        cost: { exp: 50 },
        requires: { crafting: 4, skills: { quality_crafting: 1 } }
      },
      {
        id: 'master_craftsman',
        name: '制作大师',
        description: '解锁高级制作配方，制作物品质量大幅提升',
        level: 0,
        maxLevel: 1,
        effects: { unlockAdvancedRecipes: true, craftingQuality: 0.3 },
        cost: { exp: 100 },
        requires: { crafting: 5, skills: { efficient_crafting: 2, quality_crafting: 2 } }
      }
    ]
  },
  // 生存技能
  survival: {
    name: '生存',
    icon: '🏕️',
    description: '提高生存能力和资源管理',
    skills: [
      {
        id: 'efficient_metabolism',
        name: '高效代谢',
        description: '食物和水的消耗速度减少10%',
        level: 0,
        maxLevel: 3,
        effects: { foodConsumption: -0.1, waterConsumption: -0.1 },
        cost: { exp: 20 },
        requires: null
      },
      {
        id: 'weather_adaptation',
        name: '气候适应',
        description: '恶劣天气对你的影响减少15%',
        level: 0,
        maxLevel: 2,
        effects: { weatherResistance: 0.15 },
        cost: { exp: 30 },
        requires: { survival: 2 }
      },
      {
        id: 'energy_conservation',
        name: '体力保存',
        description: '所有活动的体力消耗减少10%',
        level: 0,
        maxLevel: 2,
        effects: { energyConsumption: -0.1 },
        cost: { exp: 40 },
        requires: { survival: 3 }
      },
      {
        id: 'natural_healing',
        name: '自然恢复',
        description: '健康和精神状态的自然恢复速度提高20%',
        level: 0,
        maxLevel: 2,
        effects: { healthRecovery: 0.2, mentalRecovery: 0.2 },
        cost: { exp: 50 },
        requires: { survival: 4, skills: { efficient_metabolism: 2 } }
      },
      {
        id: 'survival_expert',
        name: '生存专家',
        description: '最大健康和精神增加15%，所有生存属性提升',
        level: 0,
        maxLevel: 1,
        effects: { maxHealth: 0.15, maxMental: 0.15, allSurvivalStats: 0.1 },
        cost: { exp: 100 },
        requires: { survival: 5, skills: { weather_adaptation: 1, energy_conservation: 1 } }
      }
    ]
  },
  // 研究技能
  research: {
    name: '研究',
    icon: '🔬',
    description: '提高科技研究效率和解锁特殊能力',
    skills: [
      {
        id: 'quick_learning',
        name: '快速学习',
        description: '研究科技所需时间减少15%',
        level: 0,
        maxLevel: 3,
        effects: { researchSpeed: 0.15 },
        cost: { exp: 20 },
        requires: null
      },
      {
        id: 'efficient_analysis',
        name: '高效分析',
        description: '分析遗物时获得的科技碎片增加20%',
        level: 0,
        maxLevel: 2,
        effects: { techFragmentYield: 0.2 },
        cost: { exp: 35 },
        requires: { research: 2 }
      },
      {
        id: 'resource_recycling',
        name: '资源回收',
        description: '研究科技时有15%几率不消耗部分材料',
        level: 0,
        maxLevel: 2,
        effects: { researchResourceSaving: 0.15 },
        cost: { exp: 45 },
        requires: { research: 3 }
      },
      {
        id: 'advanced_theory',
        name: '高级理论',
        description: '解锁高级科技研究路径',
        level: 0,
        maxLevel: 1,
        effects: { unlockAdvancedTech: true },
        cost: { exp: 60 },
        requires: { research: 4, skills: { efficient_analysis: 1 } }
      },
      {
        id: 'scientific_genius',
        name: '科学天才',
        description: '所有研究活动效率提高25%，有几率发现突破性科技',
        level: 0,
        maxLevel: 1,
        effects: { allResearchBonus: 0.25, breakthroughChance: 0.1 },
        cost: { exp: 100 },
        requires: { research: 5, skills: { quick_learning: 2, advanced_theory: 1 } }
      }
    ]
  }
}