<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { ElMessage, ElMessageBox } from 'element-plus'
import { skillTree } from '../plugins/skillTree'
const gameStore = useGameStore()

// 当前选中的技能分支
const activeSkillBranch = ref('gathering')

// 获取当前技能分支
const currentSkillBranch = computed(() => {
  return skillTree[activeSkillBranch.value]
})

// 检查技能是否可以升级
const canUpgradeSkill = (skill) => {
  if (skill.maxLevel == gameStore.unlockedSkills[skill.id]) return false
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
    '采集效果': ['gatheringEfficiency', 'gatheringEnergyCost', 'rareHerbChance', 'gatheringYield'],
    '制作效果': ['craftingSpeed', 'resourceSaving', 'extraCraftingOutput', 'toolDurability', 'craftingQuality', 'unlockAdvancedRecipes'],
    '生存效果': ['foodConsumption', 'waterConsumption', 'weatherResistance', 'energyConsumption', 'healthRecovery', 'allSurvivalStats'],
    '研究效果': ['researchSpeed', 'techFragmentYield', 'researchResourceSaving', 'unlockAdvancedTech', 'allResearchBonus', 'breakthroughChance'],
    '其他效果': ['maxHealth', 'maxEnergy']
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
    gatheringEnergyCost: '采集体力消耗',
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
    energyConsumption: '体力消耗',
    healthRecovery: '健康恢复',
    allSurvivalStats: '所有生存属性',
    // 研究效果
    researchSpeed: '研究速度',
    techFragmentYield: '科技碎片产出',
    researchResourceSaving: '研究资源节约',
    unlockAdvancedTech: '解锁高级科技',
    allResearchBonus: '所有研究加成',
    breakthroughChance: '突破性发现几率',
    // 其他效果
    maxHealth: '最大健康',
    maxEnergy: '最大体力'
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
        {{ currentSkillBranch.name }} 技能
      </div>
      <div class="branch-info">{{ currentSkillBranch.description }}</div>
      <div class="player-exp">可用经验值: {{ gameStore.player.exp }}</div>
      <el-button size="small" style="margin-top: 10px;" type="info" @click="showActiveEffects">查看当前激活效果</el-button>
    </div>
    <div class="skills-container">
      <div class="skill-path">
        <div v-for="(skill, index) in currentSkillBranch.skills" :key="skill.id" class="skill-node-container">
          <div v-if="index > 0" class="skill-connection" :class="getConnectionStyle(skill, index)"></div>
          <div class="skill-node" :class="getSkillLevelStyle(skill)">
            <div class="skill-icon">{{ currentSkillBranch.icon }}</div>
            <div class="skill-info">
              <div class="skill-name">{{ skill.name }}</div>
              <div class="skill-level">等级: {{ gameStore.unlockedSkills[skill.id] || 0 }}/{{ skill.maxLevel }}</div>
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
            <el-button style="width: 100%;" size="small" type="primary" :disabled="!canUpgradeSkill(skill)"
              @click="upgradeSkill(skill)">
              {{ gameStore.unlockedSkills[skill.id] == skill.maxLevel ? '已满级' : gameStore.unlockedSkills[skill.id] === 0
                ? '解锁' :
                '升级' }}
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