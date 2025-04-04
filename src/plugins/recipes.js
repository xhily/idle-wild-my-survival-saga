export const recipes = () => {
	return [
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
			inputs: { energy: 10 },
			outputs: { water: [5, 15] },
			duration: 60,
			skillRequired: { gathering: 1 },
			category: 'gathering'
		},
		{
			id: 'gather_wood',
			name: '收集木材',
			inputs: { energy: 15 },
			outputs: { wood: [5, 10] },
			duration: 90,
			skillRequired: { gathering: 1 },
			category: 'gathering'
		},
		{
			id: 'gather_stone',
			name: '收集石头',
			inputs: { energy: 20 },
			outputs: { stone: [5, 10] },
			duration: 120,
			skillRequired: { gathering: 1 },
			category: 'gathering'
		},
		{
			id: 'gather_herb',
			name: '采集草药',
			inputs: { energy: 15 },
			outputs: { herb: [3, 8] },
			duration: 90,
			skillRequired: { gathering: 2 },
			category: 'gathering'
		},
		{
			id: 'gather_search_metal',
			name: '寻找金属',
			inputs: { energy: 25 },
			outputs: { metal: [3, 7] },
			duration: 150,
			skillRequired: { gathering: 3 },
			category: 'gathering'
		},
		// 基础制作配方
		{
			id: 'craft_simple_tool',
			name: '制作简易工具',
			inputs: { energy: 15, wood: 5, stone: 3 },
			outputs: { tools: 1 },
			duration: 120,
			skillRequired: { crafting: 1 },
			techRequired: 'basic_crafting',
			category: 'crafting'
		},
		{
			id: 'craft_medicine',
			name: '制作药品',
			inputs: { energy: 15, herb: 5, water: 3 },
			outputs: { medicine: 1 },
			duration: 180,
			skillRequired: { crafting: 2 },
			techRequired: 'water_purification',
			category: 'crafting'
		},
		{
			id: 'craft_fuel',
			name: '制作燃料',
			inputs: { energy: 10, wood: 8 },
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
		// 研究配方
		{
			id: 'research_tech',
			name: '研究科技',
			inputs: { energy: 30, techFragment: 1 },
			outputs: { research: 1 }, // 特殊输出，由研究系统处理
			duration: 600,
			skillRequired: { research: 1 },
			category: 'research'
		},
		{
			id: 'analyze_relic',
			name: '分析遗物',
			inputs: { energy: 40, ancientRelic: 1 },
			outputs: { techFragment: [1, 3] },
			duration: 480,
			skillRequired: { research: 2 },
			category: 'research'
		}
	]
}

export const technologies = () => {
	return [
		// 基础科技
		{
			id: 'basic_survival',
			name: '基础生存',
			description: '掌握基本的生存技能',
			researched: true, // 默认已解锁
			cost: {},
			unlocks: ['basic_crafting', 'water_collection']
		},
		{
			id: 'basic_crafting',
			name: '基础制作',
			description: '学习简单工具的制作方法',
			researched: false,
			cost: { techFragment: 1 },
			unlocks: ['advanced_crafting', 'tool_making'],
			requirements: ['basic_survival']
		},
		{
			id: 'water_collection',
			name: '集水技术',
			description: '更有效地收集和储存水资源',
			researched: false,
			cost: { techFragment: 1 },
			unlocks: ['water_purification'],
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
			requirements: ['basic_crafting']
		},
		{
			id: 'tool_making',
			name: '工具制作',
			description: '制作更高效的工具',
			researched: false,
			cost: { techFragment: 2, wood: 15, stone: 10 },
			unlocks: ['advanced_tools'],
			requirements: ['basic_crafting']
		},
		{
			id: 'water_purification',
			name: '水净化',
			description: '净化水源，减少疾病风险',
			researched: false,
			cost: { techFragment: 2, herb: 5 },
			unlocks: ['medicine_brewing'],
			requirements: ['water_collection']
		},
		// 高级科技
		{
			id: 'metallurgy',
			name: '冶金技术',
			description: '学习金属冶炼和加工',
			researched: false,
			cost: { techFragment: 3, metal: 10, fuel: 5 },
			unlocks: ['advanced_construction'],
			requirements: ['advanced_crafting']
		},
		{
			id: 'advanced_tools',
			name: '高级工具',
			description: '制作精密工具',
			researched: false,
			cost: { techFragment: 3, metal: 15, tools: 2 },
			unlocks: ['mechanical_devices'],
			requirements: ['tool_making']
		},
		{
			id: 'medicine_brewing',
			name: '药剂酿造',
			description: '制作治疗药剂',
			researched: false,
			cost: { techFragment: 3, herb: 15, water: 10 },
			unlocks: ['advanced_medicine'],
			requirements: ['water_purification']
		},
	]
}