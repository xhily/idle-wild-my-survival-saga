<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()

// 计算玩家属性百分比
const healthPercentage = computed(() => {
	return (gameStore.player.health / gameStore.player.maxHealth) * 100
})

const energyPercentage = computed(() => {
	return (gameStore.player.energy / gameStore.player.maxEnergy) * 100
})

// 计算健康状态文本和颜色
const healthStatus = computed(() => {
	if (healthPercentage.value > 70) return { text: '健康', color: '#67C23A' }
	if (healthPercentage.value > 30) return { text: '受伤', color: '#E6A23C' }
	return { text: '危险', color: '#F56C6C' }
})

// 计算体力状态文本和颜色
const energyStatus = computed(() => {
	if (energyPercentage.value > 70) return { text: '精力充沛', color: '#67C23A' }
	if (energyPercentage.value > 30) return { text: '有些疲惫', color: '#E6A23C' }
	return { text: '精疲力尽', color: '#F56C6C' }
})

// 计算玩家技能总和
const totalSkillLevel = computed(() => {
	return Object.values(gameStore.skills).reduce((sum, level) => sum + level, 0)
})

const plusPlayerHealth = () => {
	if (!gameStore.resources.medicine) {
		ElMessage.error('药品不足')
		return
	}
	if (gameStore.player.health === gameStore.player.maxHealth) {
		ElMessage.error('暂时不需要药品恢复健康')
		return
	}
	gameStore.player.health += 10
	gameStore.resources.medicine -= 1
	gameStore.addToEventLog('你使用了药品，恢复了10点健康')
}

// 获取技能名称
const getSkillName = (key) => {
	const skillNames = {
		gathering: '采集',
		crafting: '制作',
		combat: '战斗',
		survival: '生存',
		research: '研究'
	}
	return skillNames[key] || key
}
</script>

<template>
	<div class="player-status">
		<div class="player-header">
			<h3>{{ gameStore.player.name }} <span class="player-level">Lv.{{ gameStore.player.level }}</span></h3>
			<div class="player-exp">
				<el-progress :percentage="(gameStore.player.exp / gameStore.player.expToNextLevel) * 100"
					:format="() => `${gameStore.player.exp}/${gameStore.player.expToNextLevel}`" :stroke-width="10"
					color="#8e44ad" />
			</div>
		</div>
		<div class="player-stats">
			<div class="stat-item">
				<div class="stat-label">
					<span class="stat-icon">❤️</span>
					<span>健康</span>
					<span class="stat-icon-plus" @click="plusPlayerHealth" v-if="gameStore.player.health !== gameStore.player.maxHealth">
						<el-icon>
							<Plus />
						</el-icon>
					</span>
					<span class="stat-value">{{ Math.floor(gameStore.player.health) }}/{{ Math.floor(gameStore.player.maxHealth) }}</span>
				</div>
				<el-progress :percentage="healthPercentage" :color="healthStatus.color" :stroke-width="15" :show-text="false" />
				<div class="stat-status" :style="{ color: healthStatus.color }">
					{{ healthStatus.text }}
				</div>
			</div>
			<div class="stat-item">
				<div class="stat-label">
					<span class="stat-icon">⚡</span>
					<span>体力</span>
					<span class="stat-value">{{ Math.floor(gameStore.player.energy) }}/{{ Math.floor(gameStore.player.maxEnergy) }}</span>
				</div>
				<el-progress :percentage="energyPercentage" :color="energyStatus.color" :stroke-width="15" :show-text="false" />
				<div class="stat-status" :style="{ color: energyStatus.color }">
					{{ energyStatus.text }}
				</div>
			</div>
		</div>
		<div class="player-skills">
			<h4>技能 <span class="skill-total">(总等级: {{ totalSkillLevel }})</span></h4>
			<div class="skill-grid">
				<div v-for="(level, skill) in gameStore.skills" :key="skill" class="skill-item">
					<div class="skill-name">{{ getSkillName(skill) }}</div>
					<div class="skill-level">Lv.{{ level }}</div>
				</div>
			</div>
		</div>
		<div class="survival-info">
			<div class="survival-item">
				<span class="survival-icon">📅</span>
				<span>生存天数: {{ gameStore.player.days }}</span>
			</div>
			<div class="survival-item">
				<span class="survival-icon">🔄</span>
				<span>轮回次数: {{ Math.floor(gameStore.player.days / 120) }}</span>
			</div>
		</div>
	</div>
</template>

<style scoped>
.player-status {
	background-color: var(--el-bg-color-overlay);
	border-radius: 4px;
	padding: 15px;
}

.player-header {
	margin-bottom: 15px;
}

.player-header h3 {
	margin-top: 0;
	margin-bottom: 10px;
	display: flex;
	align-items: center;
}

.player-level {
	font-size: 0.8em;
	background-color: #8e44ad;
	color: white;
	padding: 2px 6px;
	border-radius: 10px;
	margin-left: 10px;
}

.player-stats {
	margin-bottom: 20px;
}

.stat-item {
	margin-bottom: 12px;
}

.stat-label {
	display: flex;
	align-items: center;
	margin-bottom: 5px;
}

.stat-icon {
	margin-right: 8px;
	font-size: 1.2em;
}

.stat-value {
	margin-left: auto;
	font-size: 0.9em;
	color: var(--el-text-color-secondary);
}

.stat-status {
	font-size: 0.8em;
	text-align: right;
	margin-top: 2px;
	font-weight: bold;
}

.stat-icon-plus {
	display: flex;
	align-items: center;
	margin-left: 10px;
}

.player-skills h4 {
	margin-top: 0;
	margin-bottom: 10px;
	display: flex;
	align-items: center;
}

.skill-total {
	font-size: 0.8em;
	color: var(--el-text-color-secondary);
	margin-left: 10px;
	font-weight: normal;
}

.skill-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 10px;
}

.skill-item {
	background-color: var(--el-bg-color);
	padding: 8px;
	border-radius: 4px;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.skill-name {
	font-size: 0.9em;
}

.skill-level {
	font-weight: bold;
	color: #409EFF;
}

.survival-info {
	margin-top: 20px;
	display: flex;
	justify-content: space-between;
}

.survival-item {
	display: flex;
	align-items: center;
}

.survival-icon {
	margin-right: 8px;
}

@media (max-width: 768px) {
	.skill-grid {
		grid-template-columns: repeat(2, 1fr);
	}
}
</style>