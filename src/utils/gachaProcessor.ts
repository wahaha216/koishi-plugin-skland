import { calPercent } from ".";
import {
  GachaRecord,
  PoolsInfo,
  PoolMap,
  PoolGroupMap,
  Chars,
  SklandCharacterGachaSchedule,
} from "../types"; // 建议定义好类型

export interface ProcessOptions {
  poolMap: PoolMap;
  chars: Chars[];
}

/**
 * 判断是否为角色抽卡记录
 */
function isCharacterGacha(item: any): item is SklandCharacterGachaSchedule {
  return "charId" in item;
}

/**
 * 处理单类池子的核心逻辑
 */
export function processEndfieldPool(
  rawList: GachaRecord[],
  options: ProcessOptions,
): PoolsInfo[] {
  const { poolMap, chars } = options;

  const results: PoolsInfo[] = [];

  // 保底计数
  const categoryPityMap: Record<string, number> = {
    E_CharacterGachaPoolType_Special: 0,
    E_CharacterGachaPoolType_Weapon: 0,
    E_CharacterGachaPoolType_Standard: 0,
  };

  // 按池子分组
  const grouped: PoolGroupMap = new Map();
  [...rawList]
    .sort((a, b) => Number(a.seqId) - Number(b.seqId))
    .forEach((item) => {
      if (!grouped.has(item.poolId)) grouped.set(item.poolId, []);
      grouped.get(item.poolId)!.push(item);
    });

  // 遍历每个池子进行计算
  grouped.forEach((items, pid) => {
    const hasBanner = !["standard", "beginner"].includes(items[0].category);
    const poolInfo = poolMap[pid];
    const category = items[0].category;
    const poolDetail: PoolsInfo = {
      name: poolInfo?.pool_name || items[0].poolName || "未知卡池",
      bannerUrl: hasBanner ? poolInfo?.up6_image || "" : "",
      total: 0,
      sixCount: 0,
      fiveCount: 0,
      fourCount: 0,
      six: [],
      category,
      upName: poolInfo?.up6_name,
      upCount: 0,
      currentPity: 0,
    };

    let pityCount = 0;
    let freePityCount = 0;
    let isFirst6 = true;

    const freeItems = items.filter(
      (item) => item.category !== "" && item.isFree,
    );
    const hasGoldInFree = freeItems.some((item) => item.rarity === 6);

    items.forEach((item, idx) => {
      const isGold = item.rarity === 6;
      const isChar = isCharacterGacha(item);
      const avatarUrl = isChar
        ? chars.find((c) => c.charData.name === item.charName)?.charData
            .avatarSqUrl
        : `https://lulush.microgg.cn/BeyondUID/resource/itemiconbig/${item.weaponId}.png`;
      if (item.category !== "" && item.isFree) {
        if (hasGoldInFree) {
          // 兼容多金：如果是 6 星就推送，不是就静默
          if (item.rarity === 6) {
            const pullIndex = freeItems.indexOf(item) + 1;
            const name = item.charName;
            const isUp = name === poolInfo?.up6_name;
            if (isUp) poolDetail.upCount++;

            poolDetail.six.push({
              name,
              isUp,
              pulls: pullIndex,
              isFree: true,
              avatarUrl: avatarUrl || "",
              isLucky: pullIndex <= 10,
              isNew: item.isNew,
            });
          }
        } else {
          // 全都没中：只在处理到最后一个免费项时推送一次统计
          const isLastFree = item === freeItems[freeItems.length - 1];
          if (isLastFree) {
            poolDetail.six.push({
              name: `赠送寻访 ×${freeItems.length}`,
              isUp: false,
              pulls: 0,
              isFree: true,
              avatarUrl: "",
            });
          }
        }
      } else {
        freePityCount = 0;
        pityCount++;
        categoryPityMap[category]++;
        poolDetail.total++;
        if (isGold) {
          const name = "charName" in item ? item.charName : item.weaponName;
          const isUp = name === poolInfo?.up6_name;
          const is40MaxPityPool =
            category === "" || category === "E_CharacterGachaPoolType_Beginner";
          if (isUp) poolDetail.upCount++;
          const lastPityValue = isFirst6
            ? categoryPityMap[category] - pityCount
            : 0;
          // 当前抽数
          const currentCount =
            isFirst6 && category === "E_CharacterGachaPoolType_Special"
              ? pityCount + lastPityValue
              : pityCount;
          // 保底数
          const maxPity = is40MaxPityPool ? 40 : 80;
          const percent = calPercent(currentCount, maxPity);
          const isPity =
            isChar && category !== "E_CharacterGachaPoolType_Beginner"
              ? currentCount >= 70
              : currentCount === 40;

          poolDetail.six.push({
            name,
            pulls: pityCount,
            isUp,
            isLucky: isChar ? currentCount <= 10 : currentCount <= 5,
            isPity,
            avatarUrl: avatarUrl || "",
            isNew: item.isNew,
            lastPity: isFirst6 ? lastPityValue : 0,
            percent,
          });
          pityCount = 0;
          categoryPityMap[category] = 0;
          isFirst6 = false;
        }
      }
      switch (item.rarity) {
        case 6:
          poolDetail.sixCount++;
          break;
        case 5:
          poolDetail.fiveCount++;
          break;
        case 4:
          poolDetail.fourCount++;
          break;
      }
    });

    poolDetail.six.reverse();
    categoryPityMap[category] = poolDetail.currentPity = pityCount;
    poolDetail.offBannerCount = poolDetail.sixCount - poolDetail.upCount;
    results.push(poolDetail);
  });

  return results;
}
