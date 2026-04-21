import { readFile } from "fs/promises";
import { resolve } from "path";
import {
  GachaPoolGithub,
  SklandCharacterPoolSchedule,
  SklandWeaponPoolSchedule,
} from "../types";

export { SKLAND_API, ENDFIELD_POOL_TYPE } from "./const";

export const jsonToStringWithSpace = (obj: Object): string => {
  return JSON.stringify(obj).replace(/,/g, ", ").replace(/:/g, ": ");
};

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export { processEndfieldPool } from "./gachaProcessor";

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2).replace(/\.00$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
};

export const readLocalFile = async (path: string[]) => {
  const fullPath = resolve(__dirname, ...path);
  return await readFile(fullPath, "utf-8");
};

export {
  buildEndfieldCardJson,
  filterPoolId,
  getPoolInfo,
  calculatePoolStats,
} from "./endfield";

export function calPercent(value: number, pityValue: number = 80) {
  const p = ((value / pityValue) * 100).toFixed(2);
  return `${p}%`;
}

export { formatTs } from "./day";

export const poolsToMap = (pools: GachaPoolGithub) => {
  return Object.entries(pools).reduce<{
    charPools: SklandCharacterPoolSchedule[];
    weaponPools: SklandWeaponPoolSchedule[];
  }>(
    (acc, [pool_id, info]) => {
      if (info["pool_gacha_type"] === "char") {
        acc.charPools.push({ pool_id, ...info });
      } else {
        acc.weaponPools.push({ pool_id, ...info });
      }
      return acc;
    },
    { charPools: [], weaponPools: [] },
  );
};

export function toThousandsls(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  
  return new Intl.NumberFormat('en-US').format(num);
}