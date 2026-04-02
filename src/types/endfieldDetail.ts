interface DescLevelParams {
  level: string;
  params: Record<string, string>;
}

interface KeyValue {
  key: string;
  value: string;
}

interface CharsDataSkills {
  id: string;
  name: string;
  type: KeyValue;
  property: KeyValue;
  iconUrl: string;
  desc: string;
  descParams: Record<string, string>;
  descLevelParams: Record<string, DescLevelParams>;
}

interface AbilityTalents {
  id: string;
  name: string;
  iconUrl: string;
  desc: string;
  descParams: Record<string, string>;
  lockedIconUrl: string;
}

interface CombatTalents {
  id: string;
  name: string;
  iconUrl: string;
  desc: string;
  descParams: Record<string, string>;
  lockedIconUrl: string;
}

interface CultivationTalents {}

interface UserSkills {
  skillId: string;
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  maxLevel: 12;
}

interface Equip {
  equipId: string;
  equipData: {
    id: string;
    name: string;
    iconUrl: string;
    rarity: KeyValue;
    type: KeyValue;
    level: KeyValue;
    properties: string[];
    isAccessory: boolean;
    suit: {
      id: string;
      name: string;
      skillId: string;
      skillDesc: string;
      skillDescParams: Record<string, string>;
    };
    function: string;
    pkg: string;
  };
}

export interface Chars {
  charData: {
    id: string;
    name: string;
    avatarSqUrl: string;
    avatarRtUrl: string;
    rarity: KeyValue;
    profession: KeyValue;
    property: KeyValue;
    weaponType: KeyValue;
    skills: CharsDataSkills[];
    illustrationUrl: string;
    tags: string[];
    abilityTalents: AbilityTalents[];
    combatTalents: CombatTalents[];
    cultivationTalents: CultivationTalents[];
  };
  id: string;
  level: number;
  userSkills: Record<string, UserSkills>;
  bodyEquip: Equip;
  armEquip: Equip;
  firstAccessory: Equip;
  secondAccessory: Equip;
  tacticalItem: {
    tacticalItemId: string;
    tacticalItemData: {
      id: string;
      name: string;
      iconUrl: string;
      rarity: KeyValue;
      activeEffectType: KeyValue;
      activeEffect: string;
      passiveEffect: string;
      activeEffectParams: { value: string; value2: string };
      passiveEffectParams: { count: string; param1: string; param2: string };
    };
  };
  evolvePhase: number;
  potentialLevel: number;
  weapon: {
    weaponData: {
      id: string;
      name: string;
      iconUrl: string;
      rarity: KeyValue;
      type: KeyValue;
      function: string;
      description: string;
      skills: KeyValue[];
    };
    level: number;
    refineLevel: number;
    breakthroughLevel: number;
    gem: {
      id: string;
      icon: string;
      gemData: {
        termId: string;
        name: string;
        icon: string;
        templateId: string;
      };
    };
    wikiItemId: string;
  };
  gender: "CHAR_GENDER_FEMALE";
  ownTs: string;
  wikiIremId: string;
  talent: {
    latestBreakNode: string;
    attrNodes: string[];
    latestPassiveSkillNodes: string[];
    latestFactorySkillNodes: string[];
    latestSpaceshipSkillNodes: string[];
  };
}

interface AchieveMedals {
  achievementData: {
    id: string;
    name: string;
    initIcon: string;
    reforge2Icon: string;
    reforge3Icon: string;
    platedIcon: string;
    cateName: string;
    canCertify: boolean;
    cate: string;
    initLevel: number;
  };
  level: number;
  isPlated: boolean;
  obtainTs: string;
}

interface RoomsChars {
  charId: string;
  physicalStrength: number;
  favorability: number;
  avatarUrl: string;
}

interface Rooms {
  id: string;
  type: number;
  level: number;
  chars: RoomsChars[];
  reports: {};
}

interface Settlements {
  id: string;
  level: number;
  exp: string;
  expToLevelUp: string;
  remainMoney: string;
  moneyMax: string;
  officerCharIds: string;
  officerCharAvatar: string;
  name: string;
  lastTickTime: string;
}

interface DomainCollections {
  levelId: string;
  puzzleCount: number;
  trchestCount: number;
  equipTrchestCount: number;
  pieceCount: number;
  blackboxCount: number;
}

interface DomainLevels {
  levelId: string;
  name: string;
  puzzleCount: { count: number; total: number };
  trchestCount: { count: number; total: number };
  equipTrchestCount: { count: number; total: number };
  pieceCount: { count: number; total: number };
  blackboxCount: { count: number; total: number };
}

interface Domain {
  domainId: string;
  level: number;
  settlements: Settlements[];
  moneyMgr: { total: string; count: string };
  collections: DomainCollections[];
  levels: DomainLevels[];
  factory: null;
  name: string;
}

interface Quickaccess {
  name: string;
  icon: string;
  link: string;
}

// 接口返回数据
export interface CardDetailData {
  detail: {
    base: {
      serverName: string;
      roleId: string;
      name: string;
      createTime: string;
      saveTime: string;
      lastLoginTime: string;
      exp: number;
      // 等级
      level: number;
      worldLevel: number;
      gender: 1 | 2;
      avatarUrl: string;
      // 主线任务
      mainMission: { id: string; description: string };
      // 干员数
      charNum: number;
      // 武器数
      weaponNum: number;
      // 文档收集数
      docNum: number;
    };
    chars: Chars[];
    achieve: {
      achieveMedals: AchieveMedals[];
      display: Record<string, string>;
      count: number;
    };
    // 帝江号
    spaceShip: {
      rooms: Rooms[];
    };
    // 据点
    domain: Domain[];
    // 理智
    dungeon: {
      // 当前理智
      curStamina: string;
      // 理智满时间戳
      maxTs: string;
      // 最大理智
      maxStamina: string;
    };
    // 通行证
    bpSystem: { curLevel: number; maxLevel: number };
    // 每日任务
    dailyMission: { dailyActivation: number; maxDailyActivation: number };
    // 每周任务
    weeklyMission: { score: number; total: number };
    config: {
      charSwitch: boolean;
      charIds: string[];
    };
    currentTs: string;
    quickaccess: Quickaccess[];
  };
}
