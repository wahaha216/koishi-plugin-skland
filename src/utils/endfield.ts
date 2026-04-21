import {
  CardDetailData,
  EndfieldCardAchieveMedals,
  EndfieldCardCharacters,
  EndfieldCardCharactersProfession,
  EndfieldCardCharactersProperty,
  EndfieldCardDomain,
  EndfieldCardDomainCollections,
  EndfieldCardDomainSettlements,
  EndfieldCardRarity,
  EndfieldInfoCard,
  PoolInfo,
  PoolsInfo,
  SklandCharacterGachaSchedule,
  SklandWeaponGachaSchedule,
} from "../types";
import { calPercent, formatTs, toThousandsls } from "./";

const getRarity = (key: string) =>
  Number(key?.split("_").pop() || 0) as EndfieldCardRarity;
const getProfession = (key: string) =>
  key?.split("_").pop() as EndfieldCardCharactersProfession;
const getProoerty = (key: string) =>
  key?.split("_").pop() as EndfieldCardCharactersProperty;

/**
 * 生成渲染所需的数据
 * @param data 用户信息数据
 * @returns 渲染所需的数据
 */
export const buildEndfieldCardJson = (
  data: CardDetailData,
): EndfieldInfoCard => {
  // 醚质
  const collectionPuzzle = data.detail.domain.reduce((p, c) => {
    const count = c.collections.reduce((pc, cc) => pc + cc.puzzleCount, 0);
    return p + count;
  }, 0);
  // 储藏箱
  const collectionTrchest = data.detail.domain.reduce((p, c) => {
    const count = c.collections.reduce((pc, cc) => pc + cc.trchestCount, 0);
    return p + count;
  }, 0);
  // 装备模板箱
  const collectionEquipTrchest = data.detail.domain.reduce((p, c) => {
    const count = c.collections.reduce(
      (pc, cc) => pc + cc.equipTrchestCount,
      0,
    );
    return p + count;
  }, 0);
  // 维修灵感点
  const collectionPiece = data.detail.domain.reduce((p, c) => {
    const count = c.collections.reduce((pc, cc) => pc + cc.pieceCount, 0);
    return p + count;
  }, 0);
  // 协议采录桩
  const collectionBlackbox = data.detail.domain.reduce((p, c) => {
    const count = c.collections.reduce((pc, cc) => pc + cc.blackboxCount, 0);
    return p + count;
  }, 0);
  // 总控中枢等级
  const control = data.detail.spaceShip.rooms.find((r) => r.type === 0).level;

  // 区域
  const domain: EndfieldCardDomain[] = [];
  data.detail.domain.forEach((d) => {
    const settlements: EndfieldCardDomainSettlements[] = d.settlements.map(
      (s) => ({
        officerAvatar: s.officerCharAvatar,
        name: s.name,
        remainMoney: toThousandsls(s.remainMoney),
        moneyMax: toThousandsls(s.moneyMax),
        percent: calPercent(Number(s.remainMoney), Number(s.moneyMax)),
        level: s.level,
        exp: toThousandsls(s.exp),
        expToLevelUp: toThousandsls(s.expToLevelUp),
        expPercent:
          s.expToLevelUp === "0"
            ? "100%"
            : calPercent(Number(s.exp), Number(s.exp) + Number(s.expToLevelUp)),
        maxExp: toThousandsls(Number(s.exp) + Number(s.expToLevelUp)),
      }),
    );
    const collections: EndfieldCardDomainCollections[] = d.levels.map((l) => ({
      name: l.name,
      puzzle: { current: l.puzzleCount.count, max: l.puzzleCount.total },
      trchest: { current: l.trchestCount.count, max: l.trchestCount.total },
      equipTrchest: {
        current: l.equipTrchestCount.count,
        max: l.equipTrchestCount.total,
      },
      piece: { current: l.pieceCount.count, max: l.pieceCount.total },
      blackbox: { current: l.blackboxCount.count, max: l.blackboxCount.total },
    }));
    domain.push({
      domainId: d.domainId,
      name: d.name,
      level: d.level,
      settlements,
      collections,
      money: {
        current: toThousandsls(d.moneyMgr.count),
        max: toThousandsls(d.moneyMgr.total),
      },
    });
  });

  // 勋章
  const achieveMedals: EndfieldCardAchieveMedals[][] = [[], []];
  Object.values(data.detail.achieve.display).forEach((key, index) => {
    const t = data.detail.achieve.achieveMedals.find(
      (am) => am.achievementData.id === key,
    );
    const medalNumber = index + 1; // 勋章序号 (1-based)

    const medal = {
      name: t.achievementData.name,
      isPlated: t.isPlated,
      initIcon: t.achievementData.initIcon,
      reforge2Icon: t.achievementData.reforge2Icon,
      reforge3Icon: t.achievementData.reforge3Icon,
      platedIcon: t.achievementData.platedIcon,
    };

    // 逻辑：奇数序号放第一行，偶数序号放第二行
    if (medalNumber % 2 !== 0) {
      achieveMedals[0].push(medal);
    } else {
      achieveMedals[1].push(medal);
    }
  });

  // 角色
  const characters: EndfieldCardCharacters[] = [];
  data.detail.config.charIds.forEach((id) => {
    const t = data.detail.chars.find((c) => c.id === id);

    characters.push({
      name: t.charData.name,
      level: t.level,
      rarity: getRarity(t.charData.rarity.key),
      profession: getProfession(t.charData.profession.key),
      property: getProoerty(t.charData.property.key),
      evolvePhase: t.evolvePhase,
      potential: t.potentialLevel,
      avatarRtUrl: t.charData.avatarRtUrl,
      weapon: {
        name: t.weapon.weaponData.name,
        rarity: getRarity(t.weapon.weaponData.rarity.key),
        icon: t.weapon.weaponData.iconUrl,
        level: t.weapon.level,
        potential: t.weapon.refineLevel,
      },
      bodyEquip: {
        name: t.bodyEquip?.equipData.name,
        icon: t.bodyEquip?.equipData.iconUrl,
        rarity: getRarity(t.bodyEquip?.equipData.rarity.key),
      },
      armEquip: {
        name: t.armEquip?.equipData.name,
        icon: t.armEquip?.equipData.iconUrl,
        rarity: getRarity(t.armEquip?.equipData.rarity.key),
      },
      firstAccessory: {
        name: t.firstAccessory?.equipData.name,
        icon: t.firstAccessory?.equipData.iconUrl,
        rarity: getRarity(t.firstAccessory?.equipData.rarity.key),
      },
      secondAccessory: {
        name: t.secondAccessory?.equipData.name,
        icon: t.secondAccessory?.equipData.iconUrl,
        rarity: getRarity(t.secondAccessory?.equipData.rarity.key),
      },
      tacticalItem: {
        name: t.tacticalItem?.tacticalItemData.name,
        icon: t.tacticalItem?.tacticalItemData.iconUrl,
        rarity: getRarity(t.tacticalItem?.tacticalItemData.rarity.key),
      },
    });
  });

  return {
    uid: data.detail.base.roleId,
    name: data.detail.base.name,
    createTime: data.detail.base.createTime,
    createTimeFormat: formatTs(data.detail.base.createTime),
    lastLoginTime: data.detail.base.lastLoginTime,
    lastLoginTimeFormat: formatTs(data.detail.base.lastLoginTime),
    avatar: data.detail.base.avatarUrl,
    worldLevel: data.detail.base.worldLevel,
    protocolLevel: data.detail.base.level,
    mainMission: data.detail.base.mainMission,
    collection: {
      character: data.detail.base.charNum,
      weapon: data.detail.base.weaponNum,
      document: data.detail.base.docNum,
      puzzle: collectionPuzzle,
      trchest: collectionTrchest,
      equipTrchest: collectionEquipTrchest,
      piece: collectionPiece,
      blackbox: collectionBlackbox,
      control,
    },
    domain,
    stamina: {
      current: data.detail.dungeon.curStamina,
      max: data.detail.dungeon.maxStamina,
      maxTs: data.detail.dungeon.maxTs,
      maxFormat: formatTs(data.detail.dungeon.maxTs, "YYYY-MM-DD HH:mm:ss"),
    },
    bpSystem: {
      current: data.detail.bpSystem.curLevel,
      max: data.detail.bpSystem.maxLevel,
    },
    daily: {
      current: data.detail.dailyMission.dailyActivation,
      max: data.detail.dailyMission.maxDailyActivation,
    },
    weekly: {
      current: data.detail.weeklyMission.score,
      max: data.detail.weeklyMission.total,
    },
    achieve: { count: data.detail.achieve.count, medals: achieveMedals },
    characters,
  };
};

interface BasePool {
  pool_id: string;
}

interface BaseGacha {
  poolId: string;
}

/**
 * 过滤卡池，返回不存在的ID列表
 * @param poolList 卡池
 * @param gachaList 抽卡记录
 * @returns 不存在的ID列表
 */
export const filterPoolId = <P extends BasePool, G extends BaseGacha>(
  poolList: P[],
  gachaList: G[],
) => {
  const EXCLUDED_POOL_IDS = new Set(["beginner", "standard"]);
  const poolIds = new Set(poolList.map((p) => p.pool_id));
  const notExistCharIds = [
    ...new Set(
      gachaList
        .filter(
          (cg) => !poolIds.has(cg.poolId) && !EXCLUDED_POOL_IDS.has(cg.poolId),
        )
        .map((cg) => cg.poolId),
    ),
  ];
  return notExistCharIds;
};

/**
 * 获取卡池信息
 * @param pools 卡池列表
 * @param rawGachaList 抽卡记录
 * @returns 渲染所需的卡池信息
 */
export const getPoolInfo = (
  pools: PoolsInfo[],
  rawGachaList: (SklandCharacterGachaSchedule | SklandWeaponGachaSchedule)[],
): PoolInfo => {
  // 剔除免费抽，仅保留消耗资源的寻访用于计算水位
  const pityGachaList = rawGachaList.filter((g) =>
    "isFree" in g ? !g.isFree : true,
  );

  // 总抽数
  const totalPulls = rawGachaList.length;

  const allSixStars = pools.flatMap((p) => p.six || []);
  const upCount = allSixStars.filter((s) => s.isUp).length;
  const offCount = allSixStars.filter((s) => !s.isUp).length;

  // 计算保底 (使用剔除了免费抽的列表)
  const sortedPityGacha = [...pityGachaList].sort(
    (a, b) => Number(b.seqId) - Number(a.seqId),
  );
  const lastSixIdx = sortedPityGacha.findIndex((g) => g.rarity === 6);

  // 如果没出过金，水位就是所有非免费抽的总数
  const currentPity = lastSixIdx === -1 ? pityGachaList.length : lastSixIdx;

  const category = pityGachaList[0]?.category;
  const percent =
    category === "" ? calPercent(currentPity, 40) : calPercent(currentPity, 80);

  const averageUpPulls =
    upCount > 0 ? Number((pityGachaList.length / upCount).toFixed(1)) : 0;

  return {
    total: totalPulls,
    upCount,
    offBannerCount: offCount,
    sixCount: allSixStars.length,
    fiveCount: rawGachaList.filter((g) => g.rarity === 5).length,
    fourCount: rawGachaList.filter((g) => g.rarity === 4).length,
    currentPity,
    averageUpPulls,
    percent,
    isDone:
      category === "E_CharacterGachaPoolType_Beginner" && totalPulls === 40,
  };
};

export const calculatePoolStats = (
  rawGachaList: (SklandCharacterGachaSchedule | SklandWeaponGachaSchedule)[],
) => {
  const stats = {
    six: 0,
    five: 0,
    four: 0,
    total: rawGachaList.length,
    sixP: "0",
    fiveP: "0",
    fourP: "0",
    fivePSum: "0",
  };
  if (stats.total === 0) return stats;

  rawGachaList.forEach((item) => {
    if (item.rarity === 6) stats.six++;
    else if (item.rarity === 5) stats.five++;
    else stats.four++;
  });

  stats.sixP = ((stats.six / stats.total) * 100).toFixed(1);
  stats.fiveP = ((stats.five / stats.total) * 100).toFixed(1);
  stats.fourP = (100 - Number(stats.sixP) - Number(stats.fiveP)).toFixed(1);
  stats.fivePSum = (Number(stats.sixP) + Number(stats.fiveP)).toFixed(1);
  return stats;
};
