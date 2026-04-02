export interface GrantAppData {
  data: { uid: string; code: string };
  msg: "OK";
  status: number;
  type: "A";
}

export interface GrantWebData {
  data: { hgId: string; token: string };
  msg: "OK";
  status: number;
  type: "A";
}

export type GrantData = GrantAppData | GrantWebData;

export interface BaseResponse<T> {
  code: number;
  message: "OK";
  timestamp: string;
  data: T;
}

export interface BaseResponse2<T> {
  status: number;
  msg: "OK" | "";
  data?: T;
  type?: string;
}

export interface BaseResponse3<T> {
  code: number;
  msg: "OK" | "";
  data: T;
}

export type HgidToken = BaseResponse2<{ hgId: string; token: string }>;

export type CredData = BaseResponse<{
  cred: string;
  userId: string;
  token: string;
}>;

interface BindDataRoles {
  serverId: string;
  roleId: string;
  nickname: string;
  level: number;
  isDefault: boolean;
  isBanned: boolean;
  serverType: "domestic";
  serverName: "China";
}

export type AppCode = "arknights" | "endfield";
export type AppName = "明日方舟" | "明日方舟：终末地";
export type ChannelName = "官服" | "bilibili服";

interface BindDataList {
  appCode: AppCode;
  appName: AppName;
  bindingList: {
    uid: string;
    isOfficial: boolean;
    isDefault: boolean;
    channelMasterId: "1" | "2";
    channelName: ChannelName;
    nickName: string;
    isDelete: boolean;
    gameName: AppName;
    /**
     * 3 明日方舟：终末地
     */
    gameId: 1 | 3;
    roles: BindDataRoles[];
    defaultRole: BindDataRoles;
  }[];
  defaultUid?: string;
}

export type BindData = BaseResponse<{
  list: BindDataList[];
  serverDefaultBinding: {};
}>;

interface SignDataAward {
  awardId: string;
  available: boolean;
  done: boolean;
}

interface SignDataResourceInfo {
  id: string;
  count: number;
  name: string;
  icon: string;
}

interface SignDataArknightsResourceInfo {
  id: string;
  type: "MATERIAL" | "GOLD";
  name: string;
  rarity: number;
  stageDropList: { stageId: string; occOer: number }[];
  otherSource: string[];
  buildingProductList: { roomType: string; formulaId: string }[];
  sortId: number;
  classifyType: "NORMAL" | "MATERIAL";
}

interface SignDataArknightsAwards {
  resource: SignDataArknightsResourceInfo;
  count: number;
  type: "daily";
}

interface SignDataEndfield {
  ts: string;
  awardIds: { id: string; type: number }[];
  resourceInfoMap: Record<string, SignDataResourceInfo>;
  tomorrowAwardIds: { id: string; type: number }[];
}

interface SignDataArknights {
  ts: string;
  awards: SignDataArknightsAwards[];
  resourceInfoMap: Record<string, SignDataArknightsResourceInfo>;
  tomorrowAwards: SignDataArknightsAwards[];
}

export type SignData = BaseResponse<SignDataEndfield | SignDataArknights>;

import { PlayerInfoData } from "./arknightsCard";
export type PlayerInfo = BaseResponse<PlayerInfoData>;
export type { PlayerInfoData };

export interface SignHeader {
  platform: string;
  timestamp: string;
  dId: string;
  vName: string;
}

import { TeenagerData } from "./teenager";
export type Teenager = BaseResponse<TeenagerData>;
export type { TeenagerData };

import { CardDetailData, Chars } from "./endfieldDetail";
export type CardDetail = BaseResponse<CardDetailData>;
export type { CardDetailData, Chars };

export type RoleToken = BaseResponse2<{ token: string }>;

import {
  GachaData,
  EndfieldCharacterGacha,
  EndfieldWeaponGacha,
  GachaPoolInfo,
  GachaCategory,
  GachaCategorySeq,
  EndfieldCharPool,
  EndfieldWeaponPool,
} from "./endfieldGacha";
export type Gacha = BaseResponse2<GachaData>;
export type GachaPool<T> = BaseResponse3<GachaPoolInfo<T>>;
export type GachaPoolGithub = Record<
  string,
  EndfieldCharPool | EndfieldWeaponPool
>;
export type {
  GachaData,
  EndfieldCharacterGacha,
  EndfieldWeaponGacha,
  GachaCategory,
  GachaCategorySeq,
  GachaPoolInfo,
  EndfieldCharPool,
  EndfieldWeaponPool,
};

export {
  EndfieldCard,
  PoolsInfo,
  PoolInfo,
  EndfieldInfoCard,
  EndfieldCardAchieveMedals,
  EndfieldCardCharacters,
  EndfieldCardDomain,
  EndfieldCardDomainCollections,
  EndfieldCardDomainSettlements,
  EndfieldCardCharactersProfession,
  EndfieldCardCharactersProperty,
  EndfieldCardRarity,
} from "./endfieldCard";

export type Lang =
  | "zh-cn"
  | "en-us"
  | "ja-jp"
  | "ko-kr"
  | "zh-tw"
  | "es-mx"
  | "pt-br"
  | "fr-fr"
  | "de-de"
  | "ru-ru"
  | "it-it"
  | "id-id"
  | "th-th"
  | "vi-vn";

import { QrcodeData, QrcodeStatusData } from "./qrcode";
export type Qrcode = BaseResponse2<QrcodeData>;
export type QrcodeStatus = BaseResponse2<QrcodeStatusData>;

export {
  SklandSchedule,
  SklandCharacterPoolSchedule,
  SklandWeaponPoolSchedule,
  SklandWeaponGachaSchedule,
  SklandCharacterGachaSchedule,
  PoolMap,
  PoolGroupMap,
  GachaRecord,
  PoolRecord,
  SklandRoleSchedule,
} from "./schedule";
