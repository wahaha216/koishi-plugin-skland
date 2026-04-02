const BASE_ZONAI = "https://zonai.skland.com/api/v1";
const BASE_HYPERGRYPH_GENERAL = "https://as.hypergryph.com/general/v1";
const BASE_HYPERGRYPH_USER_V1 = "https://as.hypergryph.com/user/auth/v1";
const BASE_HYPERGRYPH_USER_V2 = "https://as.hypergryph.com/user/oauth2/v2";

// 终末地卡池类型
export enum ENDFIELD_POOL_TYPE {
  STANDARD = "E_CharacterGachaPoolType_Standard",
  SPECIAL = "E_CharacterGachaPoolType_Special",
  BEGINNER = "E_CharacterGachaPoolType_Beginner",
  WEAPON = "",
}

export const ENDFIELD_POOL = "https://ef-webview.hypergryph.com/api/content";
export const ENDFIELD_POOL_GITHUB =
  "https://raw.githubusercontent.com/FrostN0v0/EndfieldGachaPoolTable/refs/heads/master/GachaPoolTable.json";

export const SKLAND_API = {
  QRCODE: {
    SCAN: `${BASE_HYPERGRYPH_GENERAL}/gen_scan/login`,
    STATUS: `${BASE_HYPERGRYPH_GENERAL}/scan_status`,
    TOKEN: `${BASE_HYPERGRYPH_USER_V1}/token_by_scan_code`,
  },
  USER: `${BASE_ZONAI}/user/teenager`,
  CODE: {
    APP: "4ca99fa6b56cc2ba",
    WEB: "be36d44aa36bfb5b",
  },
  GRANT: `${BASE_HYPERGRYPH_USER_V2}/grant`,
  CRED: `${BASE_ZONAI}/user/auth/generate_cred_by_code`,
  BINDING: `${BASE_ZONAI}/game/player/binding`,
  ROLE_TOKEN: `https://binding-api-account-prod.hypergryph.com/account/binding/v1/u8_token_by_uid`,
  ARKNIGHTS: {
    /** 签到接口 */
    ATTENDANCE: `${BASE_ZONAI}/game/attendance`,
    /** 玩家数据 */
    PLAYER_INFO: `${BASE_ZONAI}/game/player/info`,
  },

  ENDFIELD: {
    /** 签到接口 */
    ATTENDANCE: `${BASE_ZONAI}/game/endfield/attendance`,
    /** 玩家数据 */
    PLAYER_INFO: "https://zonai.skland.com/web/v1/game/endfield/card/detail",
    // 抽卡记录
    GACHA: {
      CHARACTER: "https://ef-webview.hypergryph.com/api/record/char",
      WEAPON: "https://ef-webview.hypergryph.com/api/record/weapon",
    },
  },
};

export const USER_AGENT =
  "Skland/1.32.1 (com.hypergryph.skland; build:103201004; Android 33; ) Okhttp/4.11.0";
