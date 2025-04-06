<script setup>
import { ref, computed, watch } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { ElMessage } from 'element-plus'

const gameStore = useGameStore()

// 交易标签页
const tradeTab = ref('buy')

// 当前选中的商人
const activeMerchant = ref(null)

// 商人列表
const merchants = [
	{
		id: 'wandering_trader',
		name: '流浪商人',
		icon: '🧙‍♂️',
		description: '定期出现的神秘商人，提供各种稀有资源',
		greeting: '你好，旅行者！我有一些稀有物品，你可能会感兴趣...',
		availability: {
			minDay: 5,
			frequency: 7, // 每7天出现一次
			duration: 1,  // 持续1天
		},
		sellItems: [
			{ id: 'rare_herb', name: '稀有草药', resourceId: 'herb', buyPrice: { food: 10, water: 10, herb: 10 }, stock: 5, icon: '🌿', amount: 3 },
			{ id: 'advanced_parts', name: '高级零件', resourceId: 'advanced_parts', buyPrice: { parts: 10, tools: 5, metal: 8, wood: 15 }, stock: 2, icon: '🔧', amount: 1 },
			{ id: 'ancientRelic', name: '古代遗物', resourceId: 'ancientRelic', buyPrice: { crystal: 1 }, stock: 1, icon: '🏺', amount: 1 }
		],
		buyItems: [
			{ id: 'sell_food', name: '食物', resourceId: 'food', sellPrice: { water: 1 }, icon: '🍖' },
			{ id: 'sell_water', name: '水', resourceId: 'water', sellPrice: { food: 1 }, icon: '💧' },
			{ id: 'sell_relic', name: '古代遗物', resourceId: 'ancientRelic', sellPrice: { crystal:1, food: 30, water: 30 }, icon: '🏺' }
		],
		specialTrades: [
			{
				id: 'knowledge_exchange',
				name: '知识交换',
				description: '用你的资源换取宝贵的研究知识',
				inputs: { ancientRelic: 1, crystal:1, techFragment: 2 },
				outputs: { exp: 50 }
			}
		]
	},
	{
		id: 'settlement_trader',
		name: '定居点商人',
		icon: '👨‍🌾',
		description: '来自附近定居点的友好商人，提供基础资源交易',
		greeting: '欢迎！我们定居点有很多物资可以交换。',
		availability: {
			minDay: 10,
			frequency: 5, // 每5天出现一次
			duration: 2,  // 持续2天
		},
		sellItems: [
			{ id: 'bulk_food', name: '大量食物', resourceId: 'food', buyPrice: { wood: 15, stone: 10 }, stock: 30, icon: '🍗', amount: 20 },
			{ id: 'bulk_water', name: '大量水', resourceId: 'water', buyPrice: { wood: 15, stone: 10 }, stock: 30, icon: '🚰', amount: 20 },
			{ id: 'medicine_pack', name: '药品', resourceId: 'medicine', buyPrice: { food: 15, herb: 5 }, stock: 5, icon: '💊' }
		],
		buyItems: [
			{ id: 'sell_wood', name: '木材', resourceId: 'wood', sellPrice: { food: 1 }, icon: '🌲' },
			{ id: 'sell_stone', name: '石头', resourceId: 'stone', sellPrice: { food: 1 }, icon: '🗿' },
			{ id: 'sell_metal', name: '金属', resourceId: 'metal', sellPrice: { food: 3 }, icon: '⚙️' }
		],
		specialTrades: [
			{
				id: 'community_support',
				name: '社区支持',
				description: '为定居点提供资源，获得他们的支持',
				inputs: { food: 20, water: 20, medicine: 2 },
				outputs: { maxHealth: 5, maxEnergy: 5 }
			}
		]
	},
	{
		id: 'mysterious_stranger',
		name: '精灵',
		icon: '🧚',
		description: '罕见的精灵，提供独特而危险的交易',
		greeting: '嘘...我有些特别的东西，但代价可能很高...',
		availability: {
			minDay: 20,
			frequency: 15, // 每15天出现一次
			duration: 1,   // 持续1天
		},
		sellItems: [
			{ id: 'advanced_tech', name: '科技碎片', resourceId: 'techFragment', buyPrice: { crystal:1, ancientRelic: 2 }, stock: 3, icon: '💾', amount: 2 },
			{ id: 'rare_material', name: '水晶', resourceId: 'crystal', buyPrice: { metal: 15, tools: 2 }, stock: 3, icon: '💎', amount: 1 }
		],
		buyItems: [
			{ id: 'sell_tech', name: '科技碎片', resourceId: 'techFragment', sellPrice: { food: 25, water: 25 }, icon: '💾' },
			{ id: 'sell_parts', name: '零件', resourceId: 'parts', sellPrice: { food: 15, metal: 5 }, icon: '⚙️' }
		],
		specialTrades: [
			{
				id: 'risky_experiment',
				name: '危险实验',
				description: '参与一项危险的实验，可能获得巨大收益或损失',
				inputs: { fuel:10, medicine: 20, ancientRelic: 10, crystal: 10 },
				outputs: { exp: 1000 }
			}
		]
	},
	{
		id: 'vampire_stranger',
		name: '吸血鬼',
		icon: '🧛',
		description: '罕见的吸血鬼，顾名思义',
		greeting: '虽然价格高但是值得...',
		availability: {
			minDay: 30,
			frequency: 30, // 每15天出现一次
			duration: 1, // 持续1天
		},
		sellItems: [
			{ id: 'advanced_tech', name: '科技碎片', resourceId: 'techFragment', buyPrice: { ancientRelic: 4 }, stock: 3, icon: '💾', amount: 2 },
			{ id: 'rare_material', name: '水晶', resourceId: 'crystal', buyPrice: { techFragment: 4 }, stock: 3, icon: '💎', amount: 2 },
			{ id: 'rare_ancientRelic', name: '古代遗物', resourceId: 'ancientRelic', buyPrice: { crystal: 4 }, stock: 3, icon: '🏺', amount: 2 }
		],
		buyItems: [],
		specialTrades: []
	}
]

// 计算当前可用的商人
const availableMerchants = computed(() => {
	const currentDay = gameStore.gameTime.day
	return merchants.filter(merchant => {
		// 检查是否达到最小天数要求
		if (currentDay < merchant.availability.minDay) return false
		// 计算商人是否在当前日期出现
		const daysSinceMinDay = currentDay - merchant.availability.minDay
		const cyclePosition = daysSinceMinDay % merchant.availability.frequency
		return cyclePosition < merchant.availability.duration
	})
})

// 选择商人
const selectMerchant = (merchant) => {
	activeMerchant.value = merchant
	tradeTab.value = 'buy' // 默认显示购买标签页
}

// 商人可售物品
const merchantSellItems = computed(() => {
	if (!activeMerchant.value) return []
	return activeMerchant.value.sellItems
})

// 玩家可售物品
const playerSellableItems = computed(() => {
	if (!activeMerchant.value) return []
	return activeMerchant.value.buyItems.filter(item => {
		return gameStore.resources[item.resourceId] > 0
	})
})

// 格式化价格显示
const formatPrice = (priceObj) => {
	return Object.entries(priceObj)
		.map(([resource, amount]) => {
			if (resource === 'health' || resource === 'energy' || resource === 'mental') return `${resource === 'health' ? '健康' : resource === 'energy' ? '体力' : '精神'} ${amount}`
			return `${gameStore.getResourceName(resource)} ${amount}`
		})
		.join(', ')
}

// 检查是否能负担价格
const canAfford = (priceObj) => {
	for (const [resource, amount] of Object.entries(priceObj)) {
		if (gameStore.resources[resource] < amount) return false
	}
	return true
}

// 购买物品
const buyItem = (item) => {
	// 检查库存
	if (item.stock <= 0) {
		ElMessage.error('该物品已售罄')
		return
	}
	// 检查是否能负担价格
	if (!canAfford(item.buyPrice)) {
		ElMessage.error('资源不足')
		return
	}
	// 再次检查资源是否充足（双重保险）
	for (const [resource, amount] of Object.entries(item.buyPrice)) {
		if (gameStore.resources[resource] < amount) {
			ElMessage.error(`${gameStore.getResourceName(resource)}不足`)
			return
		}
	}
	// 扣除资源
	for (const [resource, amount] of Object.entries(item.buyPrice)) {
		gameStore.resources[resource] -= amount
	}
	// 添加物品到玩家资源，如果有amount属性则添加指定数量，否则添加1
	const resourceAmount = item.amount || 1
	gameStore.addResource(item.resourceId, resourceAmount)
	// 减少库存
	item.stock--
	// 记录交易日志
	const amountText = resourceAmount > 1 ? `${resourceAmount}单位` : ''
	gameStore.addToEventLog(`从${activeMerchant.value.name}处购买了${item.name}${amountText}`)
	ElMessage.success(`成功购买${item.name}${amountText}`)
}

// 出售物品
const sellItem = (item) => {
	// 检查玩家是否有该物品
	if (gameStore.resources[item.resourceId] <= 0) {
		ElMessage.error('你没有足够的物品')
		return
	}
	// 扣除玩家物品
	gameStore.resources[item.resourceId]--
	// 添加资源
	for (const [resource, amount] of Object.entries(item.sellPrice)) {
		if (resource === 'health') gameStore.player.health = Math.min(gameStore.player.health + amount, gameStore.player.maxHealth)
		else if (resource === 'energy') gameStore.player.energy = Math.min(gameStore.player.energy + amount, gameStore.player.maxEnergy)
		else if (resource === 'mental') gameStore.player.mental = Math.min(gameStore.player.mental + amount, gameStore.player.maxMental)
		else gameStore.addResource(resource, amount)
	}
	// 记录交易日志
	gameStore.addToEventLog(`向${activeMerchant.value.name}出售了${item.name}`)
	ElMessage.success(`成功出售${item.name}`)
}

// 检查是否可以执行特殊交易
const canExecuteSpecialTrade = (trade) => {
	for (const [resource, amount] of Object.entries(trade.inputs)) {
		if (resource === 'health') {
			if (gameStore.player.health < amount) return false
		} else if (resource === 'energy') {
			if (gameStore.player.energy < amount) return false
		} else if (resource === 'mental') {
			if (gameStore.player.mental < amount) return false
		} else if (gameStore.resources[resource] < amount) {
			return false
		}
	}
	return true
}

// 执行特殊交易
const executeSpecialTrade = (trade) => {
	// 再次检查资源是否充足
	if (!canExecuteSpecialTrade(trade)) {
		ElMessage.error('资源不足')
		return
	}
	// 扣除输入资源
	for (const [resource, amount] of Object.entries(trade.inputs)) {
		if (resource === 'health') {
			// 确保健康不会变为负数
			if (gameStore.player.health < amount) {
				ElMessage.error('健康不足')
				return
			}
			gameStore.player.health -= amount
		} else if (resource === 'energy') {
			// 确保体力不会变为负数
			if (gameStore.player.energy < amount) {
				ElMessage.error('体力不足')
				return
			}
			gameStore.player.energy -= amount
		} else if (resource === 'mental') {
			// 确保精神不会变为负数
			if (gameStore.player.mental < amount) {
				ElMessage.error('精神不足')
				return
			}
			gameStore.player.mental -= amount
		} else {
			// 确保资源不会变为负数
			if (gameStore.resources[resource] < amount) {
				ElMessage.error(`${gameStore.getResourceName(resource)}不足`)
				return
			}
			gameStore.resources[resource] -= amount
		}
	}
	// 添加输出资源
	for (const [resource, amount] of Object.entries(trade.outputs)) {
		if (resource === 'exp') {
			// 直接增加经验值并检查升级
			gameStore.player.exp += amount
			gameStore.checkLevelUp()
		} else if (resource === 'maxHealth') {
			gameStore.player.maxHealth += amount
			gameStore.player.health = Math.min(gameStore.player.health + amount, gameStore.player.maxHealth)
		} else if (resource === 'maxEnergy') {
			gameStore.player.maxEnergy += amount
			gameStore.player.energy = Math.min(gameStore.player.energy + amount, gameStore.player.maxEnergy)
		} else if (resource === 'maxMental') {
			gameStore.player.maxMental += amount
			gameStore.player.mental = Math.min(gameStore.player.mental + amount, gameStore.player.maxMental)
		} else {
			gameStore.addResource(resource, amount)
		}
	}
	// 记录交易日志
	gameStore.addToEventLog(`与${activeMerchant.value.name}完成了特殊交易: ${trade.name}`)
	ElMessage.success(`成功完成交易: ${trade.name}`)
}
</script>

<template>
	<div class="trading-system">
		<div v-if="!activeMerchant" class="merchant-selection">
			<h4>可用商人</h4>
			<el-empty v-if="availableMerchants.length === 0" description="暂无商人可交易"></el-empty>
			<div v-else class="merchant-list">
				<div v-for="merchant in availableMerchants" :key="merchant.id" class="merchant-card"
					@click="selectMerchant(merchant)">
					<div class="merchant-icon">{{ merchant.icon }}</div>
					<div class="merchant-info">
						<div class="merchant-name">{{ merchant.name }}</div>
						<div class="merchant-description">{{ merchant.description }}</div>
					</div>
				</div>
			</div>
		</div>
		<div v-else class="trading-interface">
			<div class="merchant-header">
				<div class="merchant-avatar">{{ activeMerchant.icon }}</div>
				<div class="merchant-details">
					<h4>{{ activeMerchant.name }}</h4>
					<p>{{ activeMerchant.greeting }}</p>
				</div>
				<el-button @click="activeMerchant = null" size="small">返回</el-button>
			</div>
			<el-tabs v-model="tradeTab">
				<el-tab-pane label="购买" name="buy">
					<div class="trade-items">
						<el-empty v-if="merchantSellItems.length === 0" description="商人没有可出售的物品"></el-empty>
						<div v-else class="item-grid">
							<div v-for="item in merchantSellItems" :key="item.id" class="trade-item">
								<div class="item-icon">{{ item.icon || '📦' }}</div>
								<div class="item-details">
									<div class="item-name">{{ item.name }}</div>
									<div class="item-price">价格: {{ formatPrice(item.buyPrice) }}</div>
									<div class="item-stock" :class="{ 'low-stock': item.stock < 5 }">库存: {{ item.stock }}</div>
									<div v-if="item.amount && item.amount > 1" class="item-amount">获得: {{ item.amount }}单位</div>
								</div>
								<el-button @click="buyItem(item)" :disabled="!canAfford(item.buyPrice) || item.stock <= 0" size="small">
									购买
								</el-button>
							</div>
						</div>
					</div>
				</el-tab-pane>
				<el-tab-pane label="出售" name="sell">
					<div class="trade-items">
						<el-empty v-if="playerSellableItems.length === 0" description="你没有可出售的物品"></el-empty>
						<div v-else class="item-grid">
							<div v-for="item in playerSellableItems" :key="item.id" class="trade-item">
								<div class="item-icon">{{ item.icon || '📦' }}</div>
								<div class="item-details">
									<div class="item-name">{{ item.name }}</div>
									<div class="item-price">价格: {{ formatPrice(item.sellPrice) }}</div>
									<div class="item-stock">拥有: {{ gameStore.resources[item.resourceId] }}</div>
								</div>
								<el-button @click="sellItem(item)" :disabled="gameStore.resources[item.resourceId] <= 0" size="small">
									出售
								</el-button>
							</div>
						</div>
					</div>
				</el-tab-pane>
				<el-tab-pane label="特殊交易" name="special"
					v-if="activeMerchant.specialTrades && activeMerchant.specialTrades.length > 0">
					<div class="special-trades">
						<div v-for="trade in activeMerchant.specialTrades" :key="trade.id" class="special-trade-item">
							<div class="trade-description">
								<div class="trade-title">{{ trade.name }}</div>
								<div class="trade-details">{{ trade.description }}</div>
							</div>
							<div class="trade-resources">
								<div class="trade-inputs">
									<div class="resource-label">需要:</div>
									<div v-for="(amount, resource) in trade.inputs" :key="resource" class="resource-item"
										:class="{ 'insufficient': gameStore.resources[resource] < amount }">
										{{ gameStore.getResourceName(resource) }}: {{ amount }}/{{ gameStore.resources[resource] }}
									</div>
								</div>
								<div class="trade-arrow">→</div>
								<div class="trade-outputs">
									<div class="resource-label">获得:</div>
									<div v-for="(amount, resource) in trade.outputs" :key="resource" class="resource-item">
										{{ gameStore.getResourceName(resource) }}: {{ amount }}
									</div>
								</div>
							</div>
							<el-button @click="executeSpecialTrade(trade)" :disabled="!canExecuteSpecialTrade(trade)" size="small">
								交易
							</el-button>
						</div>
					</div>
				</el-tab-pane>
			</el-tabs>
		</div>
	</div>
</template>

<style scoped>
.trading-system {
	padding: 10px;
}

.merchant-selection {
	margin-bottom: 20px;
}

.merchant-list {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	gap: 15px;
	margin-top: 10px;
}

.merchant-card {
	display: flex;
	align-items: center;
	padding: 10px;
	border-radius: 4px;
	background-color: var(--el-bg-color-overlay);
	cursor: pointer;
	transition: all 0.3s;
}

.merchant-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.merchant-icon {
	font-size: 2rem;
	margin-right: 10px;
}

.merchant-info {
	flex: 1;
}

.merchant-name {
	font-weight: bold;
	margin-bottom: 5px;
}

.merchant-description {
	font-size: 0.9rem;
	color: var(--el-text-color-secondary);
}

.trading-interface {
	background-color: var(--el-bg-color-overlay);
	border-radius: 4px;
	padding: 15px;
}

.merchant-header {
	display: flex;
	align-items: center;
	margin-bottom: 20px;
}

.merchant-avatar {
	font-size: 2.5rem;
	margin-right: 15px;
}

.merchant-details {
	flex: 1;
}

.merchant-details h4 {
	margin: 0 0 5px 0;
}

.merchant-details p {
	margin: 0;
	color: var(--el-text-color-secondary);
	font-style: italic;
}

.item-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: 15px;
	margin-top: 10px;
}

.trade-item {
	display: flex;
	flex-direction: column;
	padding: 10px;
	border-radius: 4px;
	background-color: var(--el-fill-color-light);
}

.item-icon {
	font-size: 2rem;
	margin-bottom: 10px;
	text-align: center;
}

.item-details {
	flex: 1;
	margin-bottom: 10px;
}

.item-name {
	font-weight: bold;
	margin-bottom: 5px;
}

.item-price,
.item-stock {
	font-size: 0.9rem;
	color: var(--el-text-color-secondary);
}

.low-stock {
	color: var(--el-color-danger);
}

.special-trade-item {
	display: flex;
	flex-direction: column;
	padding: 15px;
	margin-bottom: 15px;
	border-radius: 4px;
	background-color: var(--el-fill-color-light);
}

.trade-title {
	font-weight: bold;
	margin-bottom: 5px;
}

.trade-details {
	margin-bottom: 10px;
	color: var(--el-text-color-secondary);
}

.trade-resources {
	display: flex;
	align-items: center;
	margin-bottom: 15px;
}

.trade-inputs,
.trade-outputs {
	flex: 1;
}

.resource-label {
	font-weight: bold;
	margin-bottom: 5px;
}

.resource-item {
	margin-bottom: 3px;
}

.insufficient {
	color: var(--el-color-danger);
}

.trade-arrow {
	margin: 0 15px;
	font-size: 1.5rem;
	color: var(--el-text-color-secondary);
}

@media (max-width: 768px) {

	.merchant-list,
	.item-grid {
		grid-template-columns: 1fr;
	}

	.trade-resources {
		flex-direction: column;
		align-items: flex-start;
	}

	.trade-arrow {
		transform: rotate(90deg);
		margin: 10px 0;
	}
}
</style>