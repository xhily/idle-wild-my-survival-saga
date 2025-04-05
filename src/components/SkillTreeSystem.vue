<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { ElMessage, ElMessageBox } from 'element-plus'

const gameStore = useGameStore()

// 当前选中的技能分支
const activeSkillBranch = ref('gathering')

// 技能树数据
const skillTree = {
  // 采集技能树
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
        description: '采集活动消耗的能量减少10%',
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
  // 制作技能树
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
  // 生存技能树
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
        description: '所有活动的能量消耗减少10%',
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
        description: '最大健康值和精神值增加15%，所有生存属性提升',
        level: 0,
        maxLevel: 1,
        effects: { maxHealth: 0.15, maxMental: 0.15, allSurvivalStats: 0.1 },
        cost: { exp: 100 },
        requires: { survival: 5, skills: { weather_adaptation: 1, energy_conservation: 1 } }
      }
    ]
  },
  // 研究技能树
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

// 获取当前技能分支
const currentSkillBranch = computed(() => {
  return skillTree[activeSkillBranch.value]
})

// 检查技能是否可以升级
const canUpgradeSkill = (skill) => {
  // 检查是否已达到最大等级
  if (skill.level >= skill.maxLevel) return false
  // 检查经验值是否足够
  if (gameStore.player.exp < skill.cost.exp) return false
  // 检查前置要求
  if (skill.requires) {
    // 检查基础技能等级要求
    for (const [baseSkill, level] of Object.entries(skill.requires)) {
      if (baseSkill === 'skills') continue // 跳过特殊技能要求
      if (gameStore.skills[baseSkill] < level) return false
    }
    // 检查特殊技能要求
    if (skill.requires.skills) {
      for (const [reqSkill, level] of Object.entries(skill.requires.skills)) {
        // 在当前分支中查找该技能
        const requiredSkill = currentSkillBranch.value.skills.find(s => s.id === reqSkill)
        if (!requiredSkill || requiredSkill.level < level) return false
      }
    }
  }
  return true
}

// 升级技能
const upgradeSkill = (skill) => {
  if (!canUpgradeSkill(skill)) return
  // 生成效果预览信息
  let effectPreview = ''
  for (const [effect, value] of Object.entries(skill.effects)) {
    effectPreview += `\n- ${formatEffectName(effect)}: ${formatEffectValue(effect, value)}`
  }
  // 确认升级
  ElMessageBox.confirm(
    `确定要升级 ${skill.name} 吗？将消耗 ${skill.cost.exp} 点经验值。\n\n技能效果:${effectPreview}`,
    '升级技能',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    }
  ).then(() => {
    // 消耗经验值
    gameStore.player.exp -= skill.cost.exp
    // 升级技能
    skill.level++
    // 应用技能效果
    applySkillEffects(skill)
    // 记录日志
    gameStore.addToEventLog(`你升级了技能: ${skill.name} (等级 ${skill.level}/${skill.maxLevel})`)
    ElMessage.success(`技能升级成功: ${skill.name} (等级 ${skill.level}/${skill.maxLevel})`)
  }).catch(() => { })
}

// 应用技能效果
const applySkillEffects = (skill) => {
  // 更新游戏状态中的技能效果
  gameStore.updateSkillEffects(skill.id, skill.effects, skill.level)
  // 更新基础技能等级
  const branchKey = activeSkillBranch.value
  if (skill.level === 1) {
    // 如果是首次解锁技能，增加对应分支的基础技能等级
    gameStore.skills[branchKey] += 1
    gameStore.addToEventLog(`你的${gameStore.getSkillName(branchKey)}技能等级提升到了 ${gameStore.skills[branchKey]}!`)
  }
}

// 获取技能等级样式
const getSkillLevelStyle = (skill) => {
  if (skill.level === 0) return 'skill-level-0'
  if (skill.level === skill.maxLevel) return 'skill-level-max'
  return 'skill-level-partial'
}

// 获取技能连接线样式
const getConnectionStyle = (skill, index) => {
  // 第一个技能没有连接线
  if (index === 0) return ''
  // 获取前一个技能
  const prevSkill = currentSkillBranch.value.skills[index - 1]
  // 如果前一个技能未解锁，连接线为灰色
  if (prevSkill.level === 0) return 'connection-locked'
  // 如果当前技能已解锁，连接线为绿色
  if (skill.level > 0) return 'connection-unlocked'
  // 如果当前技能可以升级，连接线为黄色
  if (canUpgradeSkill(skill)) return 'connection-available'
  // 默认为灰色
  return 'connection-locked'
}

// 显示当前激活的所有技能效果
const showActiveEffects = () => {
  // 获取所有激活的技能效果
  const activeEffects = gameStore.skillTreeEffects
  // 构建效果显示内容
  let effectsContent = '<div style="max-height: 400px; overflow-y: auto;">'
  effectsContent += '<h3 style="margin-top: 0;">当前激活的技能效果</h3>'
  // 按类别分组显示效果
  const effectCategories = {
    '采集效果': ['gatheringEfficiency', 'rareResourceChance', 'gatheringEnergyCost', 'rareHerbChance', 'gatheringYield'],
    '制作效果': ['craftingSpeed', 'resourceSaving', 'extraCraftingOutput', 'toolDurability', 'craftingQuality', 'unlockAdvancedRecipes'],
    '生存效果': ['foodConsumption', 'waterConsumption', 'weatherResistance', 'energyConsumption', 'healthRecovery', 'mentalRecovery', 'allSurvivalStats'],
    '研究效果': ['researchSpeed', 'techFragmentYield', 'researchResourceSaving', 'unlockAdvancedTech', 'allResearchBonus', 'breakthroughChance'],
    '其他效果': ['maxHealth', 'maxMental', 'maxEnergy']
  }
  // 遍历所有效果类别
  for (const [category, effects] of Object.entries(effectCategories)) {
    // 检查该类别是否有激活的效果
    const hasActiveEffects = effects.some(effect => {
      const value = activeEffects[effect]
      return (typeof value === 'boolean' && value === true) ||
        (typeof value === 'number' && value !== 0)
    })
    // 如果有激活的效果，显示该类别
    if (hasActiveEffects) {
      effectsContent += `<div style="margin-top: 10px;"><strong>${category}</strong></div>`
      // 遍历该类别的所有效果
      for (const effect of effects) {
        const value = activeEffects[effect]
        // 只显示激活的效果
        if ((typeof value === 'boolean' && value === true) ||
          (typeof value === 'number' && value !== 0)) {
          const effectClass = (typeof value === 'number' && value > 0) ||
            (typeof value === 'boolean' && value === true) ?
            'color: var(--el-color-success);' :
            'color: var(--el-color-danger);'
          effectsContent += `<div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span>${formatEffectName(effect)}:</span>
            <span style="font-weight: bold; ${effectClass}">${formatEffectValue(effect, value)}</span>
          </div>`
        }
      }
    }
  }
  effectsContent += '</div>'
  // 显示效果对话框
  ElMessageBox.alert(effectsContent, '技能效果总览', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '关闭'
  })
}

// 格式化效果名称
const formatEffectName = (effect) => {
  const effectNames = {
    // 采集效果
    gatheringEfficiency: '采集效率',
    rareResourceChance: '稀有资源几率',
    gatheringEnergyCost: '采集能量消耗',
    rareHerbChance: '稀有草药几率',
    gatheringYield: '采集产出',
    // 制作效果
    craftingSpeed: '制作速度',
    resourceSaving: '资源节约几率',
    extraCraftingOutput: '额外产出几率',
    toolDurability: '工具耐久度',
    craftingQuality: '制作品质',
    unlockAdvancedRecipes: '解锁高级配方',
    // 生存效果
    foodConsumption: '食物消耗',
    waterConsumption: '水消耗',
    weatherResistance: '天气抵抗',
    energyConsumption: '能量消耗',
    healthRecovery: '健康恢复',
    mentalRecovery: '精神恢复',
    allSurvivalStats: '所有生存属性',
    // 研究效果
    researchSpeed: '研究速度',
    techFragmentYield: '科技碎片产出',
    researchResourceSaving: '研究资源节约',
    unlockAdvancedTech: '解锁高级科技',
    allResearchBonus: '所有研究加成',
    breakthroughChance: '突破性发现几率',
    // 其他效果
    maxHealth: '最大健康值',
    maxMental: '最大精神值',
    maxEnergy: '最大能量值'
  }
  return effectNames[effect] || effect
}

// 格式化效果值
const formatEffectValue = (effect, value) => {
  // 布尔值效果
  if (typeof value === 'boolean') return value ? '是' : '否'
  // 百分比效果
  if (typeof value === 'number') {
    // 负值效果（如消耗减少）显示为正向收益
    if (effect.includes('Consumption') && value < 0) return `减少 ${Math.abs(value * 100)}%`
    // 正值效果
    return `${value > 0 ? '+' : ''}${(value * 100).toFixed(0)}%`
  }
  return value
}
</script>

<template>
  <div class="skill-tree-system">
    <div class="skill-branches">
      <el-radio-group v-model="activeSkillBranch" size="large">
        <el-radio-button v-for="(branch, key) in skillTree" :key="key" :value="key">
          <span class="branch-icon">{{ branch.icon }}</span>
          {{ branch.name }}
        </el-radio-button>
      </el-radio-group>
    </div>
    <div class="branch-description">
      <div class="branch-title">
        <span class="branch-icon large">{{ currentSkillBranch.icon }}</span>
        {{ currentSkillBranch.name }} 技能树
      </div>
      <div class="branch-info">{{ currentSkillBranch.description }}</div>
      <div class="player-exp">可用经验值: {{ gameStore.player.exp }}</div>
      <el-button size="small" style="margin-top: 10px;" type="info" @click="showActiveEffects">查看当前激活效果</el-button>
    </div>
    <div class="skills-container">
      <div class="skill-path">
        <div v-for="(skill, index) in currentSkillBranch.skills" :key="skill.id" class="skill-node-container">
          <div v-if="index > 0" class="skill-connection" :class="getConnectionStyle(skill, index)"></div>
          <div class="skill-node" :class="getSkillLevelStyle(skill)" @click="upgradeSkill(skill)">
            <div class="skill-icon">{{ currentSkillBranch.icon }}</div>
            <div class="skill-info">
              <div class="skill-name">{{ skill.name }}</div>
              <div class="skill-level">等级: {{ skill.level }}/{{ skill.maxLevel }}</div>
            </div>
          </div>
          <div class="skill-details">
            <div class="skill-description">{{ skill.description }}</div>
            <div class="skill-effects">
              <div class="effects-title">技能效果:</div>
              <div v-for="(value, effect) in skill.effects" :key="effect" class="effect-item">
                <span class="effect-name">{{ formatEffectName(effect) }}:</span>
                <span class="effect-value" :class="{ 'positive-effect': value > 0, 'negative-effect': value < 0 }">
                  {{ formatEffectValue(effect, value) }}
                </span>
              </div>
            </div>
            <div class="skill-requirements" v-if="skill.requires">
              <div v-if="skill.requires.skills">
                需要技能:
                <span v-for="(level, reqSkill) in skill.requires.skills" :key="reqSkill">
                  {{currentSkillBranch.skills.find(s => s.id === reqSkill)?.name}} (等级 {{ level }})
                </span>
              </div>
              <template v-for="(level, baseSkill) in skill.requires" :key="baseSkill">
                <div v-if="baseSkill !== 'skills'">
                  需要 {{ gameStore.getSkillName(baseSkill) }} 等级 {{ level }}
                </div>
              </template>
            </div>
            <div class="skill-cost">升级消耗: {{ skill.cost.exp }} 经验值</div>
            <el-button style="width: 100%;" size="small" type="primary" :disabled="!canUpgradeSkill(skill)" @click="upgradeSkill(skill)">
              {{ skill.level === 0 ? '解锁' : '升级' }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skill-tree-system {
  background-color: var(--el-bg-color-overlay);
  border-radius: 8px;
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.skill-branches {
  margin-bottom: 15px;
}

.branch-icon {
  margin-right: 5px;
}

.branch-icon.large {
  font-size: 1.5em;
  margin-right: 8px;
}

.branch-description {
  margin-bottom: 20px;
  padding: 10px;
  background-color: var(--el-bg-color);
  border-radius: 6px;
}

.branch-title {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
}

.branch-info {
  color: var(--el-text-color-secondary);
  margin-bottom: 10px;
}

.player-exp {
  font-weight: bold;
  color: var(--el-color-success);
}

.skills-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.skill-path {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 20px 10px;
}

.skill-node-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.skill-connection {
  width: 4px;
  height: 40px;
  z-index: 1;
}

.connection-locked {
  background-color: var(--el-text-color-disabled);
}

.connection-available {
  background-color: var(--el-color-warning);
}

.connection-unlocked {
  background-color: var(--el-color-success);
}

.skill-node {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-radius: 8px;
  width: 80%;
  max-width: 400px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
  z-index: 2;
}

.skill-node:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
}

.skill-level-0 {
  background-color: var(--el-fill-color-light);
  border: 2px dashed var(--el-border-color);
  opacity: 0.7;
}

.skill-level-partial {
  background-color: var(--el-color-primary-light-9);
  border: 2px solid var(--el-color-primary);
}

.skill-level-max {
  background-color: var(--el-color-success-light-9);
  border: 2px solid var(--el-color-success);
}

.skill-icon {
  font-size: 1.8em;
  margin-right: 15px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--el-fill-color);
}

.skill-info {
  flex: 1;
}

.skill-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.skill-level {
  font-size: 0.9em;
  color: var(--el-text-color-secondary);
}

.skill-details {
  margin-top: 10px;
  padding: 10px;
  background-color: var(--el-bg-color);
  border-radius: 6px;
  width: 80%;
  max-width: 400px;
}

.skill-description {
  margin-bottom: 8px;
  line-height: 1.4;
}

.skill-requirements {
  font-size: 0.9em;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.skill-cost {
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--el-color-danger);
}

.skill-effects {
  margin-bottom: 8px;
  font-size: 0.9em;
}

.effects-title {
  font-weight: bold;
  margin-bottom: 4px;
  color: var(--el-text-color-primary);
}

.effect-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
}

.effect-name {
  color: var(--el-text-color-secondary);
}

.effect-value {
  font-weight: bold;
}

.positive-effect {
  color: var(--el-color-success);
}

.negative-effect {
  color: var(--el-color-danger);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .skill-node {
    width: 95%;
    padding: 8px 12px;
  }

  .skill-details {
    width: 95%;
  }

  .skill-icon {
    width: 35px;
    height: 35px;
    font-size: 1.5em;
    margin-right: 10px;
  }
}
</style>