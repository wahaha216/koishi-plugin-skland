export type GachaCategory =
  | "E_CharacterGachaPoolType_Standard"
  | "E_CharacterGachaPoolType_Beginner"
  | "E_CharacterGachaPoolType_Special"
  | "";

export interface EndfieldCharacterGacha {
  poolId: "standard" | "beginner" | string;
  poolName: "基础寻访" | "启程寻访" | string;
  charId: string;
  charName: string;
  rarity: 4 | 5 | 6;
  isFree: boolean;
  isNew: boolean;
  gachaTs: string;
  seqId: string;
}

export interface EndfieldWeaponGacha {
  poolId: string;
  poolName: string;
  weaponId: string;
  weaponName: string;
  weaponType: string;
  rarity: 4 | 5 | 6;
  isNew: boolean;
  gachaTs: string;
  seqId: string;
}

export interface GachaData {
  list: EndfieldCharacterGacha[] | EndfieldWeaponGacha[];
  hasMore: boolean;
}

export interface EndfieldCharPool {
  pool_gacha_type: "char";
  pool_name: string;
  pool_type: "special" | "standard" | "beginner";
  up6_name: string;
  up6_image: string;
  up5_name: string;
  up5_image: string;
  up6_item_name: string;
  rotate_image: string;
  ticket_name: string;
  ticket_ten_name: string;
  all: { id: string; name: string; rarity: 4 | 5 | 6 }[];
  rotate_list: { name: string; times: 1 | 2 | 3; image?: string }[];
}

export interface EndfieldWeaponPool {
  pool_gacha_type: "weapon";
  pool_name: string;
  link_char_pool_name: string;
  up6_name: string;
  up6_image: string;
  gift_weapon_name: string;
  gift_weapon_box_name: string;
  gift_weapon_reward_name: string;
  gift_content: { name: string; type: number }[];
  all: { id: string; name: string; rarity: 4 | 5 | 6; type: number }[];
}

export interface GachaPoolInfo<T> {
  pool: T;
  timezone: number;
}

export type GachaCategorySeq = Record<
  Exclude<GachaCategory, ""> | "Weapon",
  number
>;
