import {
  EndfieldCharacterGacha,
  GachaCategory,
  EndfieldCharPool,
  EndfieldWeaponPool,
  EndfieldWeaponGacha,
  ChannelName,
  AppName,
} from "./";

export interface SklandSchedule {
  id: string;
  token: string;
  autoSign: boolean;
}

export interface SklandRoleSchedule {
  userId: string;
  roleId: string;
  nickname: string;
  channelName: ChannelName;
  channelMasterId: string;
  gameName: AppName;
  serverId?: string;
}

export interface SklandCharacterPoolSchedule extends EndfieldCharPool {
  pool_id: string;
}

export interface SklandWeaponPoolSchedule extends EndfieldWeaponPool {
  pool_id: string;
}

export interface SklandCharacterGachaSchedule extends EndfieldCharacterGacha {
  userId: string;
  category: Exclude<GachaCategory, "Weapon">;
}

export interface SklandWeaponGachaSchedule extends EndfieldWeaponGacha {
  userId: string;
  category: "";
}

export type PoolRecord = SklandCharacterPoolSchedule | SklandWeaponPoolSchedule;

export type PoolMap = Record<string, PoolRecord>;

export type GachaRecord =
  | SklandCharacterGachaSchedule
  | SklandWeaponGachaSchedule;
export type PoolGroupMap = Map<string, GachaRecord[]>;
