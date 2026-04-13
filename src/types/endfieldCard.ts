import { ENDFIELD_POOL_TYPE } from "../utils/const";
import { GachaCategory } from "./";

/** 寻访池详细统计信息 */
export interface PoolInfo {
  /** 该池子累计寻访总次数 */
  total: number;

  /** 获得本期 UP 6星角色的总数量 */
  upCount: number;

  /** 没抽到 UP (歪了) 的 6星角色数量 */
  offBannerCount?: number;

  /** * 距离上一次出 6星后，当前已经垫了多少抽 (水位)
   * @description 80 抽保底，跨池继承
   */
  currentPity: number;

  /** * 获得每个 UP 角色平均消耗的抽数
   * @formula 总抽数 / UP数量
   */
  averageUpPulls?: number;

  /** * 6星角色获得总数 (UP + 歪)
   */
  sixCount: number;
  fiveCount: number;
  // 四星
  fourCount: number;
  // 保底进度
  percent?: string;
  // 已完成（仅限新手池）
  isDone?: boolean;
}

interface CharData {
  // 头像URL
  avatarUrl?: string;
  // 角色名称
  name?: string;
  // 抽数
  pulls?: number;
  // UP角色
  isUp?: boolean;
  // 超非
  isPity?: boolean;
  // 超欧
  isLucky?: boolean;
  // NEW
  isNew?: boolean;
  // 歪
  isOffBanner?: boolean;
  // 免费获取
  isFree?: boolean;
  // 保底进度
  percent?: string;
  // 上一个卡池保底
  lastPity?: number;
}

export interface PoolsInfo extends PoolInfo {
  /** 卡池横幅 */
  bannerUrl?: string;
  /** 卡池名称 */
  name: string;
  /** UP角色名称 */
  upName?: string;
  /** 6星数据 */
  six: CharData[];
  category?: GachaCategory;
}

interface PieState {
  six: number;
  five: number;
  four: number;
  total: number;
  sixP: string;
  fiveP: string;
  fourP: string;
  fivePSum: string;
}

interface GachaWichPie extends PoolInfo {
  stats: PieState;
}

export interface EndfieldCard {
  /** UID */
  uid: string;
  /** 昵称 */
  name: string;
  /** 头像 */
  avatarUrl: string;
  // 花费的嵌晶玉
  crystalJade: string;
  // 获得的武器配额
  weaponQuota: string;
  // 使用的武器配额
  useWeaponQuota: string;
  /** 抽卡数据 */
  gacha?: {
    total: { character: number; weapon: number };
    standard: GachaWichPie;
    special: GachaWichPie;
    beginner: GachaWichPie;
    weapon: GachaWichPie;
  };
  /** 卡池详情 */
  pools: Record<keyof typeof ENDFIELD_POOL_TYPE, PoolsInfo[]>;
}

export interface EndfieldCardDomainSettlements {
  // 驻扎干员头像
  officerAvatar: string;
  // 当前剩余
  remainMoney: string;
  // 券最大值
  moneyMax: string;
  // 百分比进度
  percent: string;
  // 据点等级
  level: number;
  // 据点名
  name: string;
  // 当前经验值
  exp: string;
  // 剩余多少经验升级
  expToLevelUp: string;
  // 经验值百分比
  expPercent: string;
  maxExp: string;
}

export interface EndfieldCardDomainCollections {
  // 区域名
  name: string;
  // 醚质
  puzzle: { current: number; max: number };
  // 储藏箱
  trchest: { current: number; max: number };
  // 装备模板箱
  equipTrchest: { current: number; max: number };
  // 维修灵感点
  piece: { current: number; max: number };
  // 协议采录桩
  blackbox: { current: number; max: number };
}

export interface EndfieldCardDomain {
  domainId: string;
  // 据点名
  name: string;
  // 区域等级
  level: number;
  // 调度券
  money: { current: string; max: string };
  // 据点
  settlements: EndfieldCardDomainSettlements[];
  // 关卡收集
  collections: EndfieldCardDomainCollections[];
}

export interface EndfieldCardAchieveMedals {
  // 勋章名称
  name: string;
  // 是否镀层
  isPlated: boolean;
  // 初始图标
  initIcon: string;
  // 2级图标
  reforge2Icon: string;
  // 3级图标
  reforge3Icon: string;
  // 镀层图标
  platedIcon: string;
}

export interface EndfieldCardCharactersEquip {
  // 名称
  name: string;
  icon: string;
  // 稀有度
  rarity: EndfieldCardRarity;
}

export type EndfieldCardCharactersProfession =
  | "assault"
  | "caster"
  | "defender"
  | "guard"
  | "supporter"
  | "vanguard";

export type EndfieldCardCharactersProperty =
  | "cryst"
  | "fire"
  | "natural"
  | "physical"
  | "pulse"
  | "vanguard";

export type EndfieldCardRarity = 1 | 2 | 3 | 4 | 5 | 6;

export interface EndfieldCardCharacters {
  // 干员名称
  name: string;
  // 等级
  level: number;
  // 稀有度
  rarity: EndfieldCardRarity;
  // 职业
  profession: EndfieldCardCharactersProfession;
  // 伤害类型
  property: EndfieldCardCharactersProperty;
  // 精英等级
  evolvePhase: number;
  // 潜能
  potential: number;
  avatarRtUrl: string;
  // 武器
  weapon: {
    // 名称
    name: string;
    // 稀有度
    rarity: EndfieldCardRarity;
    // 武器图标
    icon: string;
    // 等级
    level: number;
    // 潜能
    potential: number;
  };
  // 胸甲
  bodyEquip: EndfieldCardCharactersEquip;
  // 护手
  armEquip: EndfieldCardCharactersEquip;
  // 配件1
  firstAccessory: EndfieldCardCharactersEquip;
  // 配件2
  secondAccessory: EndfieldCardCharactersEquip;
  // 恢复道具
  tacticalItem: EndfieldCardCharactersEquip;
}

// 渲染所需数据
export interface EndfieldInfoCard {
  uid: string;
  name: string;
  // 苏醒时间
  createTime: string;
  createTimeFormat: string;
  // 上次登录时间
  lastLoginTime: string;
  lastLoginTimeFormat: string;
  // 头像
  avatar: string;
  // 世界等级
  worldLevel: number;
  // 协议等级
  protocolLevel: number;
  // 主线任务
  mainMission: { id: string; description: string };
  // 收集
  collection: {
    // 角色
    character: number;
    // 武器
    weapon: number;
    // 文件
    document: number;
    // 醚质
    puzzle: number;
    // 储藏箱
    trchest: number;
    // 装备模板箱
    equipTrchest: number;
    // 维修灵感点
    piece: number;
    // 协议采录桩
    blackbox: number;
    // 总控中枢
    control: number;
  };
  // 据点
  domain: EndfieldCardDomain[];
  // 理智
  stamina: {
    // 当前
    current: string;
    // 最大
    max: string;
    // 满理智时间
    maxTs: string;
    maxFormat: string;
  };
  // 通行证
  bpSystem: { current: number; max: number };
  // 日常
  daily: { current: number; max: number };
  // 周常
  weekly: { current: number; max: number };
  achieve: { count: number; medals: EndfieldCardAchieveMedals[][] };
  characters: EndfieldCardCharacters[];
}
