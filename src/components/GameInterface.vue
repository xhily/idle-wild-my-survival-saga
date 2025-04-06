<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import ResourcePanel from './ResourcePanel.vue'
import BuildingPanel from './BuildingPanel.vue'
import EventLog from './EventLog.vue'
import PlayerStatus from './PlayerStatus.vue'
import ResearchPanel from './ResearchPanel.vue'
import ActivityPanel from './ActivityPanel.vue'
import ExplorationPanel from './ExplorationPanel.vue'
import TimeControl from './TimeControl.vue'
import WeatherSystem from './WeatherSystem.vue'
import AchievementSystem from './AchievementSystem.vue'
import RandomEventSystem from './RandomEventSystem.vue'
import TradingSystem from './TradingSystem.vue'
import QuestSystem from './QuestSystem.vue'
import SkillTreeSystem from './SkillTreeSystem.vue'
import { ElMessage } from 'element-plus'
import { saveAs } from 'file-saver'

const gameStore = useGameStore()
const gameTimerId = ref(null)

const gameState = computed(() => gameStore.gameState)

// 中央面板标签页
const centerPanelTab = ref('activity')

// 开始游戏时间循环
const startGameTimer = () => {
	if (gameTimerId.value) return
	gameTimerId.value = setInterval(() => {
		// 每秒推进游戏时间
		if (gameState.value === 'playing') gameStore.advanceTime(gameStore.gameTime.timeScale)
	}, 1000)
}

// 初始化游戏
const initGame = () => {
	// 尝试加载存档
	const loaded = gameStore.loadGame()
	if (!loaded) {
		// 没有存档，初始化新游戏
		gameStore.initGame()
		ElMessage.success('新游戏已开始')
	} else {
		ElMessage.success('游戏存档已加载')
	}
	startGameTimer()
}

// 重新开始游戏
const restartGame = () => {
	gameStore.initGame()
	ElMessage.success('游戏已重新开始')
	startGameTimer()
}

// 保存游戏
const saveGame = () => {
	gameStore.saveGame()
	ElMessage.success('游戏数据已保存')
}

// 暂停/继续游戏
const togglePause = () => {
	if (gameStore.gameState === 'playing') {
		gameStore.gameState = 'paused'
		ElMessage.info('游戏已暂停')
	} else if (gameStore.gameState === 'paused') {
		gameStore.gameState = 'playing'
		ElMessage.info('游戏已继续')
	}
}

// 导出存档
const download = () => {
	try {
		saveAs(
			new Blob([localStorage.getItem(__APP_NAME__)], { type: 'application/json' }),
			`${__APP_TITLE__}存档数据-${new Date().toISOString().slice(0, 10)}-${Date.now()}.json`
		)
		ElMessage.success('存档已导出')
	} catch (error) {
		ElMessage.error('存档导出失败：' + error.message)
	}
}

// 导入存档
const upload = (data) => {
	const file = data.file
	const reader = new FileReader()
	reader.onload = (e) => {
		try {
			localStorage.setItem(__APP_NAME__, e.target.result)
			location.reload()
		} catch (error) {
			ElMessage.error('存档导入失败：' + error.message)
		}
	}
	reader.readAsText(file);
}

// 切换暗黑模式
const toggleDarkMode = () => {
	gameStore.settings.darkMode = !gameStore.settings.darkMode
	clickDarkMode()
}

const clickDarkMode = () => document.documentElement.classList.toggle('dark', gameStore.settings.darkMode)

// 组件挂载时
onMounted(() => {
	initGame()
	clickDarkMode()
})

// 组件卸载时清除定时器
onUnmounted(() => {
	if (gameTimerId.value) clearInterval(gameTimerId.value)
})
</script>

<template>
	<div class="game-container">
		<div class="game-header">
			<div class="game-controls">
				<el-button class="button" @click="toggleDarkMode" size="small">
					<el-icon v-if="gameStore.settings.darkMode">
						<Sunny />
					</el-icon>
					<el-icon v-else>
						<Moon />
					</el-icon>
					{{ !gameStore.settings.darkMode ? '夜间模式' : '白天模式' }}
				</el-button>
				<el-button class="button" @click="saveGame" :disabled="gameState !== 'playing'" size="small">
					<el-icon>
						<MessageBox />
					</el-icon>
					保存数据
				</el-button>
				<el-button class="button" @click="gameStore.initGame" size="small">
					<el-icon>
						<Delete />
					</el-icon>
					删除数据
				</el-button>
				<el-button class="button" @click="togglePause" size="small">
					<el-icon v-if="gameState === 'playing'">
						<VideoPause />
					</el-icon>
					<el-icon v-else>
						<VideoPlay />
					</el-icon>
					{{ gameState === 'playing' ? '暂停游戏' : '继续游戏' }}
				</el-button>
				<el-button class="button" @click="download" size="small">
					<el-icon>
						<Download />
					</el-icon>
					导出存档
				</el-button>
				<el-upload class="button el-button el-button--small" action="#" style="display: unset" :http-request="upload"
					:show-file-list="false" accept="application/json">
					<el-icon>
						<Upload />
					</el-icon>
					导入存档
				</el-upload>
				<el-button tag="a" target="_blank" href="https://github.com/setube/idle-wild-my-survival-saga" class="button"
					size="small">
					<el-icon>
						<Link />
					</el-icon>
					开源地址
				</el-button>
				<el-popover class="box-item" content="QQ群:920930589" placement="top-start">
					<template #reference>
						<el-button class="button" size="small">
							<el-icon>
								<Position />
							</el-icon>
							游戏群聊
						</el-button>
					</template>
				</el-popover>
			</div>
		</div>
		<div class="game-main">
			<div class="game-panel left-panel">
				<PlayerStatus />
				<ResourcePanel />
			</div>
			<div class="game-panel center-panel">
				<el-tabs v-model="centerPanelTab" class="full-height-tabs">
					<el-tab-pane label="活动" name="activity">
						<ActivityPanel />
					</el-tab-pane>
					<el-tab-pane label="建筑" name="building">
						<BuildingPanel />
					</el-tab-pane>
					<el-tab-pane label="研究" name="research">
						<ResearchPanel />
					</el-tab-pane>
					<el-tab-pane label="探索" name="exploration">
						<ExplorationPanel />
					</el-tab-pane>
					<el-tab-pane label="交易" name="trading">
						<TradingSystem />
					</el-tab-pane>
					<el-tab-pane label="任务" name="quests">
						<QuestSystem />
					</el-tab-pane>
					<el-tab-pane label="技能树" name="skilltree">
						<SkillTreeSystem />
					</el-tab-pane>
					<el-tab-pane label="成就" name="achievements">
						<AchievementSystem />
					</el-tab-pane>
				</el-tabs>
			</div>
			<div class="game-panel right-panel">
				<TimeControl />
				<WeatherSystem />
				<RandomEventSystem />
				<EventLog />
			</div>
		</div>
		<el-dialog :model-value="gameStore.gameState === 'gameover'"
			@update:model-value="gameStore.gameState = $event ? 'gameover' : 'playing'" title="游戏结束" width="30%"
			:close-on-click-modal="false" :show-close="false">
			<span>你没能在这个严酷的世界生存下来...</span>
			<span>生存天数: {{ gameStore.player.days }}</span>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="restartGame">重新开始</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<style scoped>
.game-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	padding: 10px;
	box-sizing: border-box;
	background-color: var(--el-bg-color);
	color: var(--el-text-color-primary);
}

.game-header {
	display: grid;
	justify-content: end;
	align-items: center;
	padding: 10px;
	margin-bottom: 10px;
}

.game-controls {
	display: flex;
	flex-wrap: wrap;
}

.game-controls {
	display: flex;
	flex-wrap: wrap;
}

@media (max-width: 768px) {
	.game-controls {
		justify-content: center;
	}

	.button {
		width: calc(33% - 12px);
		margin-top: 10px;
	}

	.button:nth-child(4) {
		margin-left: 0;
	}
}

.game-main {
	display: flex;
	flex: 1;
	gap: 10px;
	overflow: hidden;
}

.game-panel {
	background-color: var(--el-bg-color-overlay);
	border-radius: 4px;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
	padding: 15px;
	overflow-y: auto;
}

.left-panel {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 15px;
}

.center-panel {
	flex: 2;
}

.right-panel {
	flex: 1;
}

@media (max-width: 768px) {
	.game-main {
		flex-direction: column;
	}
}

.full-height-tabs {
	height: auto;
}

.full-height-tabs :deep(.el-tabs__content) {
	flex: 1;
	overflow: hidden;
}

.full-height-tabs :deep(.el-tab-pane) {
	height: 100%;
	overflow-y: auto;
}
</style>