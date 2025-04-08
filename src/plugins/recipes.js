export const recipes =[
	// 基础采集配方
	{
		id: 'gather_food',
		name: '采集食物',
		inputs: { energy: 10 },
		outputs: { food: [5, 15] }, // [最小值, 最大值]
		duration: 60, // 秒
		skillRequired: { gathering: 1 },
		category: 'gathering'
	},
	{
		id: 'gather_water',
		name: '收集水',
		inputs: { food: 2, energy: 10 },
		outputs: { water: [5, 15] },
		duration: 60,
		skillRequired: { gathering: 1 },
		category: 'gathering'
	},
	{
		id: 'gather_wood',
		name: '收集木材',
		inputs: { food: 5, water: 5, energy: 15 },
		outputs: { wood: [5, 10] },
		duration: 90,
		skillRequired: { gathering: 1 },
		category: 'gathering'
	},
	{
		id: 'gather_stone',
		name: '收集石头',
		inputs: { food: 5, water: 5, energy: 20 },
		outputs: { stone: [5, 10] },
		duration: 120,
		skillRequired: { gathering: 1 },
		category: 'gathering'
	},
	{
		id: 'gather_herb',
		name: '采集草药',
		inputs: { food: 5, water: 5, energy: 15 },
		outputs: { herb: [3, 8] },
		duration: 90,
		skillRequired: { gathering: 2 },
		category: 'gathering'
	},
	{
		id: 'gather_search_metal',
		name: '寻找金属',
		inputs: { food: 5, water: 5, energy: 25 },
		outputs: { metal: [3, 7] },
		duration: 150,
		skillRequired: { gathering: 3 },
		category: 'gathering'
	},
	{
		id: 'gather_rare_herb',
		name: '采集稀有草药',
		inputs: { food: 10, water: 10, energy: 30 },
		outputs: { rare_herb: [1, 3] },
		duration: 300,
		skillRequired: { gathering: 4 },
		category: 'gathering'
	},
	// 基础制作配方
	{
		id: 'craft_simple_tool',
		name: '制作简易工具',
		inputs: { energy: 15, wood: 5, stone: 3, metal: 2 },
		outputs: { tools: 1 },
		duration: 120,
		skillRequired: { crafting: 1 },
		techRequired: 'basic_crafting',
		category: 'crafting'
	},
	{
		id: 'craft_medicine',
		name: '制作药品',
		inputs: { energy: 15, herb: 5, water: 3, rare_herb: 2 },
		outputs: { medicine: 1 },
		duration: 180,
		skillRequired: { crafting: 2 },
		techRequired: 'medicine_brewing',
		category: 'crafting'
	},
	{
		id: 'craft_fuel',
		name: '制作燃料',
		inputs: { energy: 10, wood: 8, water: 10 },
		outputs: { fuel: 2 },
		duration: 150,
		skillRequired: { crafting: 2 },
		category: 'crafting'
	},
	{
		id: 'craft_parts',
		name: '制作零件',
		inputs: { energy: 20, metal: 5, tools: 1 },
		outputs: { parts: 2 },
		duration: 240,
		skillRequired: { crafting: 3 },
		techRequired: 'metallurgy',
		category: 'crafting'
	},
	{
		id: 'craft_advanced_parts',
		name: '制作高级零件',
		inputs: { parts: 5, energy: 20, metal: 5, tools: 1 },
		outputs: { advanced_parts: 1 },
		duration: 500,
		skillRequired: { crafting: 3 },
		techRequired: 'advanced_tools',
		category: 'crafting'
	},
	{
		id: 'craft_electronic_components',
		name: '制作电子元件',
		inputs: { advanced_parts: 2, parts: 5, energy: 20, metal: 5, tools: 1 },
		outputs: { electronic_components: 2 },
		duration: 500,
		skillRequired: { crafting: 5 },
		techRequired: 'advanced_tools',
		category: 'crafting'
	},
]

export const technologies = [
	// 基础科技
	{
		id: 'basic_survival',
		name: '基础生存',
		description: '掌握基本的生存技能',
		researched: true, // 默认已解锁
		cost: {},
		researchTime: 60,
		unlocks: ['basic_crafting', 'water_collection']
	},
	{
		id: 'basic_crafting',
		name: '基础制作',
		description: '学习简单工具的制作方法',
		researched: false,
		cost: { techFragment: 1 },
		unlocks: ['advanced_crafting', 'tool_making'],
		researchTime: 60,
		requirements: ['basic_survival']
	},
	{
		id: 'water_collection',
		name: '集水技术',
		description: '更有效地收集和储存水资源',
		researched: false,
		cost: { techFragment: 1 },
		unlocks: ['water_purification'],
		researchTime: 60,
		requirements: ['basic_survival']
	},
	// 进阶科技
	{
		id: 'advanced_crafting',
		name: '进阶制作',
		description: '学习复杂物品的制作方法',
		researched: false,
		cost: { techFragment: 2 },
		unlocks: ['metallurgy'],
		researchTime: 600,
		requirements: ['basic_crafting']
	},
	{
		id: 'tool_making',
		name: '工具制作',
		description: '制作更高效的工具',
		researched: false,
		cost: { techFragment: 2, wood: 15, stone: 10 },
		unlocks: ['advanced_tools'],
		researchTime: 600,
		requirements: ['basic_crafting']
	},
	{
		id: 'water_purification',
		name: '水净化',
		description: '净化水源，减少疾病风险',
		researched: false,
		cost: { techFragment: 2, herb: 5 },
		unlocks: ['medicine_brewing'],
		researchTime: 600,
		requirements: ['water_collection']
	}
]

export const availableBuildings = [
	{
		id: 'shelter',
		name: '简易庇护所',
		description: '提供基本的居住场所，增加体力恢复速度',
		levels: [
			{
				level: 1,
				cost: { wood: 10, stone: 5 },
				effects: { energyRecovery: 1 },
				requirements: { survival: 1 }
			},
			{
				level: 2,
				cost: { wood: 20, stone: 15, metal: 5 },
				effects: { energyRecovery: 2 },
				requirements: { survival: 2, crafting: 1 }
			},
			{
				level: 3,
				cost: { wood: 40, stone: 30, metal: 15, tools: 2 },
				effects: { energyRecovery: 3, maxHealth: 10 },
				requirements: { survival: 5, crafting: 10 }
			},
			{
				level: 4,
				cost: { crystal: 5, techFragment: 5, wood: 100, stone: 100, metal: 100, tools: 20 },
				effects: { energyRecovery: 5, maxHealth: 50 },
				requirements: { survival: 10, crafting: 10 }
			},
			{
				level: 5,
				cost: { crystal: 10, techFragment: 10, wood: 200, stone: 200, metal: 200, tools: 100 },
				effects: { energyRecovery: 10, maxHealth: 100 },
				requirements: { survival: 20, crafting: 20 }
			}
		]
	},
	{
		id: 'storage',
		name: '储物区',
		description: '增加资源存储上限',
		levels: [
			{
				level: 1,
				cost: { wood: 15, stone: 5 },
				effects: { storageMultiplier: 1.2 },
				requirements: { gathering: 1 }
			},
			{
				level: 2,
				cost: { wood: 30, stone: 15, metal: 5 },
				effects: { storageMultiplier: 1.5 },
				requirements: { gathering: 2, crafting: 1 }
			},
			{
				level: 3,
				cost: { wood: 50, stone: 30, metal: 15, tools: 3 },
				effects: { storageMultiplier: 2 },
				requirements: { gathering: 3, crafting: 2 }
			},
			{
				level: 4,
				cost: { crystal: 5, techFragment: 5, wood: 100, stone: 100, metal: 100, tools: 20 },
				effects: { storageMultiplier: 2.5 },
				requirements: { gathering: 10, crafting: 10 }
			},
			{
				level: 5,
				cost: { crystal: 10, techFragment: 10, wood: 100, stone: 100, metal: 100, tools: 100 },
				effects: { storageMultiplier: 3 },
				requirements: { gathering: 20, crafting: 20 }
			}
		]
	},
	{
		id: 'workshop',
		name: '工作坊',
		description: '提高制作效率，解锁更多制作配方',
		levels: [
			{
				level: 1,
				cost: { wood: 20, stone: 10, metal: 5 },
				effects: { craftingEfficiency: 1.1 },
				requirements: { crafting: 1 }
			},
			{
				level: 2,
				cost: { wood: 35, stone: 20, metal: 15, tools: 2 },
				effects: { craftingEfficiency: 1.25 },
				requirements: { crafting: 2 }
			},
			{
				level: 3,
				cost: { wood: 60, stone: 40, metal: 30, tools: 5, parts: 3 },
				effects: { craftingEfficiency: 1.5 },
				requirements: { crafting: 3, research: 1 }
			},
			{
				level: 4,
				cost: { crystal: 5, techFragment: 5, wood: 200, stone: 100, metal: 100, tools: 20, parts: 20 },
				effects: { craftingEfficiency: 2 },
				requirements: { crafting: 10, research: 10 }
			},
			{
				level: 5,
				cost: { crystal: 10, techFragment: 10, metal: 200, tools: 50 },
				effects: { craftingEfficiency: 3 },
				requirements: { crafting: 20, research: 20 }
			}
		]
	},
	{
		id: 'garden',
		name: '菜园',
		description: '提供稳定的食物来源',
		levels: [
			{
				level: 1,
				cost: { wood: 10, stone: 5, water: 10 },
				effects: { foodPerDay: 3 },
				requirements: { gathering: 2 }
			},
			{
				level: 2,
				cost: { wood: 20, stone: 10, water: 20, tools: 1 },
				effects: { foodPerDay: 6 },
				requirements: { gathering: 3 }
			},
			{
				level: 3,
				cost: { wood: 40, stone: 20, water: 30, tools: 3 },
				effects: { foodPerDay: 10 },
				requirements: { gathering: 4 }
			},
			{
				level: 4,
				cost: { crystal: 5, techFragment: 5, wood: 100, stone: 100, water: 100, tools: 50 },
				effects: { foodPerDay: 15 },
				requirements: { gathering: 10 }
			},
			{
				level: 5,
				cost: { crystal: 10, techFragment: 10, wood: 200, stone: 100, water: 200, tools: 50 },
				effects: { foodPerDay: 20 },
				requirements: { gathering: 20 }
			}
		]
	},
	{
		id: 'well',
		name: '水井',
		description: '提供稳定的水源',
		levels: [
			{
				level: 1,
				cost: { wood: 5, stone: 15 },
				effects: { waterPerDay: 3 },
				requirements: { survival: 2 }
			},
			{
				level: 2,
				cost: { wood: 10, stone: 30, tools: 1 },
				effects: { waterPerDay: 6 },
				requirements: { survival: 3 }
			},
			{
				level: 3,
				cost: { wood: 20, stone: 50, metal: 10, tools: 2 },
				effects: { waterPerDay: 10 },
				requirements: { survival: 4 }
			},
			{
				level: 4,
				cost: { crystal: 5, techFragment: 5, wood: 100, stone: 100, metal: 100, tools: 50 },
				effects: { waterPerDay: 15 },
				requirements: { survival: 10 }
			},
			{
				level: 5,
				cost: { crystal: 10, techFragment: 10, wood: 200, stone: 200, metal: 100, tools: 50 },
				effects: { waterPerDay: 20 },
				requirements: { survival: 20 }
			}
		]
	},
	{
		id: 'medicinalGarden',
		name: '药草园',
		description: '种植和培育草药',
		levels: [
			{
				level: 1,
				cost: { wood: 15, water: 15, herb: 5 },
				effects: { herbPerDay: 2 },
				requirements: { gathering: 3 }
			},
			{
				level: 2,
				cost: { wood: 25, water: 25, herb: 10, tools: 2 },
				effects: { herbPerDay: 4, medicinePerDay: 1 },
				requirements: { gathering: 4, research: 2 }
			},
			{
				level: 3,
				cost: { wood: 40, water: 40, herb: 20, tools: 4 },
				effects: { herbPerDay: 7, medicinePerDay: 2 },
				requirements: { gathering: 5, research: 3 }
			},
			{
				level: 4,
				cost: { crystal: 5, techFragment: 5, wood: 100, water: 100, herb: 100, tools: 50 },
				effects: { herbPerDay: 10, medicinePerDay: 3 },
				requirements: { gathering: 10, research: 10 }
			},
			{
				level: 5,
				cost: { crystal: 10, techFragment: 10, wood: 200, water: 200, herb: 200, tools: 50 },
				effects: { herbPerDay: 13, medicinePerDay: 4 },
				requirements: { gathering: 20, research: 20 }
			}
		]
	},
	{
		id: 'forge',
		name: '锻造坊',
		description: '加工金属，制作工具和零件',
		levels: [
			{
				level: 1,
				cost: { wood: 20, stone: 30, metal: 15 },
				effects: { toolsPerDay: 1 },
				requirements: { crafting: 3 }
			},
			{
				level: 2,
				cost: { wood: 30, stone: 50, metal: 30, tools: 3 },
				effects: { toolsPerDay: 2, partsPerDay: 1 },
				requirements: { crafting: 4, research: 2 }
			},
			{
				level: 3,
				cost: { wood: 50, stone: 80, metal: 50, tools: 5, fuel: 10 },
				effects: { toolsPerDay: 3, partsPerDay: 2 },
				requirements: { crafting: 5, research: 3 }
			},
			{
				level: 4,
				cost: { crystal: 5, techFragment: 5, wood: 100, stone: 200, metal: 100, tools: 50, fuel: 100 },
				effects: { toolsPerDay: 4, partsPerDay: 3 },
				requirements: { crafting: 10, research: 10 }
			},
			{
				level: 5,
				cost: { crystal: 10, techFragment: 10, wood: 100, stone: 200, metal: 100, tools: 50, fuel: 100 },
				effects: { toolsPerDay: 5, partsPerDay: 4 },
				requirements: { crafting: 20, research: 20 }
			}
		]
	}
]
