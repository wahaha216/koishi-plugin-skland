import { createHash, createHmac } from "crypto";
import { Config } from "../";
import { h, HTTP, Logger, Session, sleep } from "koishi";
import {
  BindData,
  CardDetail,
  CredData,
  EndfieldCard,
  Gacha,
  EndfieldCharacterGacha,
  EndfieldWeaponGacha,
  GachaPool,
  GrantAppData,
  GrantData,
  GrantWebData,
  HgidToken,
  Lang,
  PlayerInfo,
  Qrcode,
  QrcodeStatus,
  RoleToken,
  SignData,
  SignHeader,
  Teenager,
  TeenagerData,
  GachaCategorySeq,
  GachaPoolGithub,
  SklandCharacterPoolSchedule,
  SklandWeaponPoolSchedule,
  SklandRoleSchedule,
} from "../types";
import {
  SKLAND_API,
  USER_AGENT,
  ENDFIELD_POOL_TYPE,
  ENDFIELD_POOL,
  ENDFIELD_POOL_GITHUB,
} from "../utils/const";
import { delay, jsonToStringWithSpace, poolsToMap } from "../utils";

export class Skland {
  private config: Config;
  private http: HTTP;
  private logger: Logger;
  private session: Session;

  constructor(config: Config, http: HTTP, logger: Logger, session?: Session) {
    this.config = config;
    this.http = http;
    this.logger = logger;
    this.session = session;
  }

  public async getQrcode() {
    const res = await this.http.post<Qrcode>(SKLAND_API.QRCODE.SCAN, {
      appCode: SKLAND_API.CODE.APP,
    });
    return res.data;
  }

  public async checkQrcodeStatus(
    scanId: string,
    onState?: (status: number) => void,
  ) {
    let count = 0;
    let lastStatus: number;
    const max = 24;
    while (count < max) {
      // 延迟5秒
      await delay(5000);
      const res = await this.http.get<QrcodeStatus>(SKLAND_API.QRCODE.STATUS, {
        params: { scanId },
      });
      this.logger.info(res);
      this.logger.info(`第${count + 1}次检查二维码状态：${res.msg}`);
      if (res.status !== lastStatus) {
        onState?.(res.status);
        lastStatus = res.status;
      }
      if (res.status === 0) return res.data.scanCode;
      if (res.status === 102) throw new Error("二维码已失效");
      count++;
      if (count === max) {
        switch (res.status) {
          case 100:
            throw new Error("未扫码");
          case 101:
            throw new Error("扫码未确认");
          default:
            break;
        }
      }
    }
  }

  public async getTokenByScanCode(scanCode: string) {
    const res = await this.http.post<HgidToken>(SKLAND_API.QRCODE.TOKEN, {
      scanCode,
    });
    if (res.status) throw new Error(res.msg);
    return res.data.token;
  }

  // 生成森空岛专用的签名
  public generateSign(
    token: string,
    path: string,
    body: string,
  ): { md5Sign: string; signHeader: SignHeader } {
    // -10是避免神奇的服务器时间与设备时间不一致导致的签名过期问题
    const timestamp = (Math.floor(Date.now() / 1000) - 10).toString();
    const signHeader: SignHeader = {
      platform: "",
      timestamp,
      dId: "",
      vName: "",
    };
    const signHeaderStr = JSON.stringify(signHeader);
    if (this.config.debug) this.logger.info(`签名头字符串：${signHeaderStr}`);

    // 签名原文: path + query/body + timestamp + signHeader
    const signStr = path + body + timestamp + signHeaderStr;
    if (this.config.debug) this.logger.info(`签名字符串：${signStr}`);

    // HMAC-SHA256
    const hmac = createHmac("sha256", token);
    hmac.update(signStr);
    const hmacHex = hmac.digest("hex");

    // MD5
    const md5Sign = createHash("md5").update(hmacHex).digest("hex");

    return { md5Sign, signHeader };
  }

  /**
   * 获取Grant Code
   * @param token Token
   * @param type 类型，0：森空岛，1：通行证
   * @returns Grant Code
   */
  public async getGrantCode(token: string, type: 0 | 1): Promise<string> {
    const grantData = await this.http.post<GrantData>(SKLAND_API.GRANT, {
      appCode: type ? SKLAND_API.CODE.WEB : SKLAND_API.CODE.APP,
      token,
      type,
    });
    if (this.config.debug) {
      this.logger.info("Grant Code 数据：");
      this.logger.info(grantData);
    }
    if (type === 0) {
      return (grantData as GrantAppData).data.code;
    } else {
      return (grantData as GrantWebData).data.token;
    }
  }

  public async getBindData(token: string): Promise<SklandRoleSchedule[]> {
    const code = await this.getGrantCode(token, 0);
    const credData = await this.http.post<CredData>(SKLAND_API.CRED, {
      code,
      kind: 1,
    });
    const cred = credData.data.cred;
    const signToken = credData.data.token;
    if (this.config.debug) {
      this.logger.info("Cred 和 SignToken 数据：");
      this.logger.info(cred);
      this.logger.info(signToken);
    }

    // 第三步：获取绑定角色信息
    const { md5Sign, signHeader } = this.generateSign(
      signToken,
      new URL(SKLAND_API.BINDING).pathname,
      "",
    );
    const bindData = await this.http.get<BindData>(SKLAND_API.BINDING, {
      headers: { cred, sign: md5Sign, ...signHeader },
    });
    if (this.config.debug) {
      this.logger.info("绑定角色信息数据：");
      this.logger.info(bindData);
    }
    const roles: SklandRoleSchedule[] = [];
    bindData.data.list.forEach((app) => {
      if (!["arknights", "endfield"].includes(app.appCode)) return;
      app.bindingList.forEach((b) => {
        if (app.appCode === "arknights") {
          roles.push({
            userId: "",
            roleId: b.uid,
            nickname: b.nickName,
            channelName: b.channelName,
            channelMasterId: b.channelMasterId,
            gameName: b.gameName,
          });
        } else {
          b.roles.forEach((r) => {
            roles.push({
              userId: "",
              roleId: r.roleId,
              nickname: r.nickname,
              channelName: b.channelName,
              channelMasterId: b.channelMasterId,
              gameName: b.gameName,
              serverId: r.serverId,
            });
          });
        }
      });
    });
    return roles;
  }

  public async getBindDataContext(token: string) {
    const code = await this.getGrantCode(token, 0);

    const credData = await this.http.post<CredData>(SKLAND_API.CRED, {
      code,
      kind: 1,
    });
    const cred = credData.data.cred;
    const signToken = credData.data.token;
    if (this.config.debug) {
      this.logger.info("Cred 和 SignToken 数据：");
      this.logger.info(cred);
      this.logger.info(signToken);
    }

    // 第三步：获取绑定角色信息
    const { md5Sign, signHeader } = this.generateSign(
      signToken,
      new URL(SKLAND_API.BINDING).pathname,
      "",
    );
    const bindData = await this.http.get<BindData>(SKLAND_API.BINDING, {
      headers: { cred, sign: md5Sign, ...signHeader },
    });
    if (this.config.debug) {
      this.logger.info("绑定角色信息数据：");
      this.logger.info(bindData);
    }
    return { cred, signToken, bindData, code };
  }

  private buildHeaders(cred: string, sign: string, signHeader: SignHeader) {
    return {
      cred,
      "User-Agent": USER_AGENT,
      "Accept-Encoding": "gzip",
      Connection: "close",
      sign,
      ...signHeader,
      "Content-Type": "application/json; charset=UTF-8",
    };
  }

  /**
   * 签到
   * @returns
   */
  public async sign(token: string) {
    let text = "";
    const { cred, signToken, bindData } = await this.getBindDataContext(token);

    // text = `====== ${bindData.data.list[]} 签到结果 ======`;
    for (const app of bindData.data.list) {
      // 只处理 明日方舟 和 明日方舟：终末地
      if (!["arknights", "endfield"].includes(app.appCode)) continue;
      for (const binding of app.bindingList) {
        const playerName = binding.nickName || binding.defaultRole?.nickname;
        this.logger.info(
          `正在为游戏 ${app.appName} 的角色 ${playerName} 签到...`,
        );
        let signUrl: string;
        // 根据 appCode 选择不同的签到接口
        switch (app.appCode) {
          case "arknights":
            signUrl = SKLAND_API.ARKNIGHTS.ATTENDANCE;
            break;
          case "endfield":
            signUrl = SKLAND_API.ENDFIELD.ATTENDANCE;
            break;
          default:
            break;
        }
        const body = {
          uid: binding.uid,
          gameId: binding.gameId,
          roleId: binding.defaultRole?.roleId,
          serverId: binding.defaultRole?.serverId,
        };
        const payloadBody = jsonToStringWithSpace(body);
        const { md5Sign: sign, signHeader: sh } = this.generateSign(
          signToken,
          new URL(signUrl).pathname,
          payloadBody,
        );

        const headers = this.buildHeaders(cred, sign, sh);
        const res = await fetch(signUrl, {
          method: "POST",
          headers,
          body: jsonToStringWithSpace(body),
        });

        const resJson = (await res.json()) as SignData;
        if (this.config.debug) {
          this.logger.info("签到结果数据：");
          this.logger.info(resJson);
        }
        const name_app_channel = `\n${app.appName}（${binding.channelName}） - ${playerName}`;
        // 请求成功
        switch (resJson.code) {
          case 0: {
            let awardText: string = "";
            // 明日方舟与明日方舟：终末地的奖励数据结构不同，分别处理
            if ("awards" in resJson.data) {
              // 明日方舟
              resJson.data.awards.forEach((award) => {
                // 拼接奖励内容
                awardText += `${award.resource.name}*${award.count}、`;
              });
            } else {
              // 明日方舟：终末地
              const resourceInfoMap = resJson.data.resourceInfoMap;
              resJson.data.awardIds.forEach((award) => {
                const awardId = award.id;
                const awardInfo = resourceInfoMap[awardId];
                // 拼接奖励内容
                awardText += `${awardInfo.name} * ${awardInfo.count}、`;
              });
            }
            // 去除最后一个顿号、
            awardText = awardText.slice(0, -1);
            text += `\n${name_app_channel} 签到成功！获得奖励：${awardText}`;
            break;
          }
          case 10001: {
            // 请求失败 - 已经签到过了
            text += `\n${name_app_channel} 今日已签到，请勿重复签到！`;
            break;
          }
          case 10003: {
            // 请求失败 - 设备时间与服务器不一致
            text += `\n${name_app_channel} 请勿修改设备本地时间！`;
            break;
          }
          default: {
            // 未识别的返回码
            text += `\n未识别的返回码：${resJson.code}，${resJson.message}。请联系开发者！`;
            break;
          }
        }
      }
    }
  }

  public async getSklandUserInfo(token: string): Promise<TeenagerData> {
    const { cred, signToken } = await this.getBindDataContext(token);
    const { md5Sign: sign, signHeader: sh } = this.generateSign(
      signToken,
      new URL(SKLAND_API.USER).pathname,
      "",
    );
    const headers = this.buildHeaders(cred, sign, sh);
    const res = await this.http.get<Teenager>(SKLAND_API.USER, { headers });
    return res.data;
  }

  /**
   * 获取明日方舟数据
   */
  public async getPlayerInfo(token: string) {
    // for (const account of this.config.sklands) {
    const { cred, signToken, bindData } = await this.getBindDataContext(token);
    let uid: string;
    for (const app of bindData.data.list) {
      if (app.appCode === "arknights") {
        uid = app.bindingList[0].uid;
        break;
      }
    }
    const params = new URLSearchParams({ uid }).toString();
    if (this.config.debug) this.logger.info(`请求玩家信息，参数：${params}`);
    const pathname = new URL(SKLAND_API.ARKNIGHTS.PLAYER_INFO).pathname;
    const { md5Sign: sign, signHeader: sh } = this.generateSign(
      signToken,
      pathname,
      params,
    );
    const headers = this.buildHeaders(cred, sign, sh);
    const playerInfo = await this.http.get<PlayerInfo>(
      `${SKLAND_API.ARKNIGHTS.PLAYER_INFO}?${params}`,
      { headers },
    );
    return playerInfo.data;
    // }
  }

  /**
   * 获取终末地数据
   */
  public async getCardDetail(token: string) {
    const { cred, signToken, bindData } = await this.getBindDataContext(token);
    const userData = await this.getSklandUserInfo(token);

    const userId: string = userData.teenager.userId;
    let serverId: string;
    let roleId: string;
    for (const app of bindData.data.list) {
      if (app.appCode === "endfield") {
        serverId = app.bindingList[0].defaultRole.serverId;
        roleId = app.bindingList[0].defaultRole.roleId;
        break;
      }
    }
    const params = { roleId, serverId, userId };
    const paramsStr = new URLSearchParams(params).toString();
    this.logger.info(`请求玩家信息，参数：${paramsStr}`);
    const pathname = new URL(SKLAND_API.ENDFIELD.PLAYER_INFO).pathname;

    const { md5Sign: sign, signHeader: sh } = this.generateSign(
      signToken,
      pathname,
      paramsStr,
    );
    const headers = this.buildHeaders(cred, sign, sh);

    const playerInfo = await this.http.get<CardDetail>(
      `${SKLAND_API.ENDFIELD.PLAYER_INFO}`,
      { headers, params },
    );
    return playerInfo.data;
  }

  public async getRoleToken() {
    this.http.post(
      SKLAND_API.ROLE_TOKEN,
      {},
      { headers: { "content-type": "application/json" } },
    );
  }

  /**
   * 获取明日方舟抽卡记录
   */
  public async getArknightGachaHistory() {}

  /**
   * 获取卡池信息
   * @param pool_id 卡池ID
   * @param server_id 服务器ID
   * @param lang 语言
   * @returns 卡池信息
   */
  public async getEndfieldGachaPoolInfo<T>(
    pool_id: string,
    server_id: string,
    lang: Lang = "zh-cn",
  ) {
    const res = await this.http.get<GachaPool<T>>(ENDFIELD_POOL, {
      params: { pool_id, server_id, lang },
    });
    if (res.code === 0) return res.data;
    return res.code;
  }

  public async getEndfieldGachaPoolInfoFromGithub() {
    const res = await this.http.get<GachaPoolGithub>(ENDFIELD_POOL_GITHUB, {
      responseType: "json",
    });
    return poolsToMap(res);
  }

  /**
   * 获取明日方舟：终末地抽卡记录
   */
  public async getEndfieldGachaHistory(
    token: string,
    categorySeq?: GachaCategorySeq,
  ) {
    const { bindData } = await this.getBindDataContext(token);
    const web_token = await this.getGrantCode(token, 1);

    let userId: string;
    let serverId: string;
    for (const app of bindData.data.list) {
      if (app.appCode === "endfield") {
        userId = app.bindingList[0].uid;
        serverId = app.bindingList[0].defaultRole.serverId;
        break;
      }
    }
    // 获取role token
    const res = await this.http.post<RoleToken>(
      SKLAND_API.ROLE_TOKEN,
      { uid: userId, token: web_token },
      { headers: { "content-type": "application/json" } },
    );
    const roleToken = res.data.token;
    // 抽卡列表
    const gachaObj: {
      character: EndfieldCharacterGacha[];
      weapon: EndfieldWeaponGacha[];
    } = { character: [], weapon: [] };
    // 循环查询所有卡池类型
    for (const pool_type of Object.values(ENDFIELD_POOL_TYPE)) {
      let hasMore = true;

      // 查询参数
      const params = {
        token: roleToken,
        server_id: serverId,
        lang: "zh-cn",
        pool_type,
        seq_id: undefined,
      };
      // 终末地抽卡记录一次只能查5条
      // 需要循环获取
      const isWeapon = pool_type === ENDFIELD_POOL_TYPE.WEAPON;
      const url = isWeapon
        ? SKLAND_API.ENDFIELD.GACHA.WEAPON
        : SKLAND_API.ENDFIELD.GACHA.CHARACTER;

      if (this.config.debug)
        this.logger.info(
          `卡池类型: ${isWeapon ? "Weapon" : pool_type}, url: ${url}`,
        );

      const currentPoolSeq = categorySeq[isWeapon ? "Weapon" : pool_type] || 0;
      while (hasMore) {
        if (this.config.debug)
          this.logger.info(`请求参数: ${JSON.stringify(params)}`);

        const gacha_res = await this.http.get<Gacha>(url, { params });
        const list = gacha_res.data?.list || [];
        if (!list.length) break;
        if (isWeapon) {
          gachaObj.weapon.push(...(list as EndfieldWeaponGacha[]));
        } else {
          gachaObj.character.push(...(list as EndfieldCharacterGacha[]));
        }
        // 检查查询的seq是否小于数据库中存在的seq，小于则说明重复数据
        let isRepeat = false;
        for (const gacha of list) {
          if (Number(gacha.seqId) <= currentPoolSeq) isRepeat = true;
        }
        if (isRepeat) break;
        params.seq_id = list[list.length - 1].seqId;
        hasMore = gacha_res.data.hasMore;
      }
    }
    return gachaObj;
  }
}
