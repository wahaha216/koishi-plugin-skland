interface MedalLayout {
  id: string;
  pos: [number, number];
}

interface AssistChars {
  charId: string;
  skinId: string;
  level: number;
  evolvePhase: number;
  potentialRank: number;
  skillId: string;
  mainSkillLvl: number;
  specializeLevel: number;
  equip: { id: string; level: number; locked: boolean };
}

interface Chars {
  charId: string;
  skinId: string;
  level: number;
  evolvePhase: number;
  potentialRank: number;
  mainSkillLvl: number;
  skills: { id: string; specializeLevel: number }[];
  equip: { id: string; level: number; locked: boolean };
  favorPercent: number;
  defaultSkillId: string;
  gainTime: number;
  defaultEquipId: string;
  sortId: number;
  exp: number;
  gold: number;
  rarity: number;
}

interface Skins {
  id: string;
  ts: number;
}

interface Chars {
  charId: string;
  ap: number;
  lastApAddTime: number;
  index: number;
  bubble: {
    normal: { add: number; ts: number };
    assist: { add: number; ts: number };
  };
  workTime: number;
}

interface Powers {
  slotId: string;
  level: number;
  chars: Chars[];
}

interface Manufactures {
  slotId: string;
  level: number;
  chars: Chars[];
  completeWorkTime: number;
  lastUpdateTime: number;
  formulaId: string;
  capacity: number;
  weight: number;
  complete: number;
  remain: number;
  speed: number;
}

interface Tradings {
  slotId: string;
  level: number;
  chars: Chars[];
  completeWorkTime: number;
  lastUpdateTime: number;
  strategy: string;
  stock: [];
  stockLimit: number;
}

interface Dormitories {
  slotId: string;
  level: number;
  chars: Chars[];
  /**
   * 舒适度
   */
  comfort: 5000;
}

type ClueString = "RHINE" | "PENGUIN" | "BLACKSTEEL" | "URSUS" | "RHODES";

interface Meeting {
  slotId: string;
  level: number;
  chars: Chars[];
  /**
   * 线索
   */
  clue: {
    own: number;
    received: number;
    dailyReward: boolean;
    needReceive: number;
    board: Array<ClueString>;
    sharing: boolean;
    shareCompleteTime: number;
  };
  lastUpdateTime: number;
  completeWorkTime: number;
}

interface Elevators {
  slotId: string;
  slotState: number;
  level: number;
}

interface Corridors {
  slotId: string;
  slotState: number;
  level: number;
}

interface Recruit {
  startTs: number;
  finishTs: number;
  state: number;
}

interface CampaignRecord {
  campaignId: string;
  maxKills: number;
}

interface TowerRecord {
  towerId: string;
  best: number;
}

interface RogueRecord {
  rogueId: string;
  relicCnt: number;
  bank: { current: number; record: number };
  clearTime: number;
  bpLevel: number;
  medal: { total: number; current: number };
}

interface Zones {
  zoneId: string;
  zoneReplicaId: string;
  clearedStage: number;
  totalStage: number;
}

interface Activity {
  actId: string;
  actReplicaId: string;
  zones: Zones[];
}

interface CharInfo {
  id: string;
  name: string;
  nationId: string;
  groupId: string;
  displayNumber: string;
  rarity: number;
  profession: string;
  subProfessionId: string;
  subProfessionName: string;
  appellation: string;
  sortId: number;
}

interface SkinInfo {
  id: string;
  name: string;
  brandId: string;
  sortId: number;
  displayTagId: "" | "活动获得" | "联动获得";
  charId: string;
}

interface StageInfo {
  id: string;
  code: string;
  name: string;
  zoneId: string;
  diffGroup: string;
  stageType: "ACTIVITY";
  dangerLevel: "-";
  apCost: number;
  difficulty: "NORMAL";
}

interface ActivityInfo {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  rewardEndTime: number;
  isReplicate: boolean;
  type: "SIDESTORY" | "MINISTORY";
  dropItemIds: string[];
  shopGoodItemIds: string[];
  favorUpList: string[];
  picUrl: string;
}

interface TowerInfo {
  id: string;
  name: string;
  subName: string;
  picUrl: string;
}

interface RogueInfo {
  id: string;
  name: string;
  sort: number;
  picUrl: string;
}

interface CampaignInfo {
  id: string;
  name: string;
  campaignZoneId: string;
  picUrl: string;
}

interface CampaignZoneInfo {
  id: string;
  name: string;
}

interface EquipmentInfo {
  id: string;
  name: string;
  typeIcon: "original";
  shiningColor: "grey";
}

interface ManufactureFormulaInfo {
  id: string;
  itemId: string;
  count: number;
  weight: number;
  costs: number[];
  costPoint: number;
}

interface BossRush {
  id: string;
  record: {
    played: boolean;
    stageId: string;
    difficulty: string;
  };
  picUrl: string;
}

interface SandBoxSubQuest {
  id: string;
  name: string;
  done: boolean;
}

interface SandBox {
  id: string;
  name: string;
  maxDay: number;
  maxDayChallenge: number;
  mainQuest: number;
  subQuest: SandBoxSubQuest[];
  baseLv: number;
  unlockNode: number;
  enemyKill: number;
  createRift: number;
  fixRift: number[];
  picUrl: string;
}

export interface PlayerInfoData {
  currentTs: number;
  showConfig: {
    charSwitch: boolean;
    skinSwitch: boolean;
    standingsSwitch: boolean;
  };
  status: {
    uid: string;
    name: string;
    level: number;
    avatar: {
      type: "ASSISTANT";
      id: string;
      url: string;
    };
    registerTs: number;
    mainStageProgress: string;
    secretary: {
      charId: string;
      skinId: string;
    };
    resume: string;
    subscriptionEnd: number;
    ap: {
      current: number;
      max: number;
      lastApAddTime: number;
      completeRecoveryTime: number;
    };
    storeTs: number;
    lastOnlineTs: number;
    charCnt: number;
    furnitureCnt: number;
    skinCnt: number;
    exp: {
      current: number;
      max: number;
    };
    serverName: string;
  };
  medal: {
    type: "CUSTOM";
    template: string;
    templateMedalList: [];
    customMedalLayout: MedalLayout[];
    total: number;
  };
  assistChars: AssistChars[];
  chars: Chars[];
  skins: Skins[];
  building: {
    tiredChars: [];
    /**
     * 发电站
     */
    powers: Powers[];
    /**
     * 制造站
     */
    Manufactures: Manufactures[];
    tradings: Tradings[];
    /**
     * 宿舍
     */
    dormitories: Dormitories[];
    /**
     * 会议室
     */
    meeting: Meeting[];
    hire: {
      slotId: string;
      level: number;
      chars: Chars[];
      state: number;
      refreshCount: number;
      completeWorkTime: number;
      slotState: number;
    };
    training: {
      slotId: string;
      level: number;
      trainee: null;
      trainer: null;
      remainPoint: number;
      speed: number;
      lastUpdateTime: number;
      remainSecs: number;
      slotState: number;
    };
    labor: {
      maxValue: number;
      value: number;
      lastUpdateTime: number;
      remainSecs: number;
    };
    furniture: {
      total: number;
    };
    elevators: Elevators[];
    corridors: Corridors[];
    /**
     * 控制室
     */
    control: {
      slotId: string;
      slotState: number;
      level: number;
      chars: Chars[];
    };
  };
  recruit: Recruit[];
  campaign: {
    records: CampaignRecord[];
    reward: {
      current: number;
      total: number;
    };
  };
  tower: {
    records: TowerRecord[];
  };
  rogue: {
    records: RogueRecord[];
  };
  routine: {
    daily: { current: number; total: number };
    weekly: { current: number; total: number };
  };
  activity: Activity[];
  charInfoMap: Record<string, CharInfo>;
  skinInfoMap: Record<string, SkinInfo>;
  stageInfoMap: Record<string, StageInfo>;
  activityInfoMap: Record<string, ActivityInfo>;
  towerInfoMap: Record<string, TowerInfo>;
  rogueInfoMap: Record<string, RogueInfo>;
  campaignInfoMap: Record<string, CampaignInfo>;
  campaignZoneInfoMap: Record<string, CampaignZoneInfo>;
  equipmentInfoMap: Record<string, EquipmentInfo>;
  manufactureFormulaInfoMap: Record<string, ManufactureFormulaInfo>;
  charAssets: [];
  skinAssets: [];
  activityBannerList: {
    list: [];
  };
  bossRush: BossRush[];
  bannerList: string[];
  sandbox: SandBox[];
}
