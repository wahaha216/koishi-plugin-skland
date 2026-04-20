import { $, Context, h, Schema, Session } from "koishi";
import { Skland } from "./entity";
import { readFileSync } from "fs";
import { resolve } from "path";
import {
  EndfieldCard,
  GachaCategorySeq,
  SklandCharacterGachaSchedule,
  SklandCharacterPoolSchedule,
  SklandWeaponPoolSchedule,
  SklandSchedule,
  SklandWeaponGachaSchedule,
  EndfieldCharPool,
  EndfieldWeaponPool,
  SklandRoleSchedule,
  AppName,
  GachaPoolGithub,
} from "./types";
import hbs from "handlebars";
import qrcode from "qrcode";
import {
  buildEndfieldCardJson,
  calculatePoolStats,
  filterPoolId,
  formatNumber,
  getPoolInfo,
  processEndfieldPool,
  ENDFIELD_POOL_TYPE,
  poolsToMap,
} from "./utils";
import {} from "koishi-plugin-cron";
import {} from "koishi-plugin-puppeteer";
import localGachaMap from "./data/gacha_map.json";

export const name = "skland";

export interface Config {
  cron: string;
  debug: boolean;
}

export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    cron: Schema.string().default("30 0 * * *"),
  }),
  Schema.object({
    debug: Schema.boolean().default(false),
  }),
]).i18n({
  "zh-CN": require("./locales/zh-CN")._config,
  "en-US": require("./locales/en-US")._config,
});

export const inject = {
  required: ["http", "cron", "database", "puppeteer"],
  optional: [],
};

declare module "koishi" {
  interface Tables {
    skland: SklandSchedule;
    skland_role: SklandRoleSchedule;
    skland_endfield_char_pool: SklandCharacterPoolSchedule;
    skland_endfield_weapon_pool: SklandWeaponPoolSchedule;
    skland_endfield_char_gacha: SklandCharacterGachaSchedule;
    skland_endfield_weapon_gacha: SklandWeaponGachaSchedule;
  }
}

export async function apply(ctx: Context, config: Config) {
  hbs.registerHelper("gt", (a, b) => a > b);
  hbs.registerHelper("eq", (a, b) => a === b);
  // 格式化数量显示
  hbs.registerHelper("formatCount", (obj: { current: number; max: number }) => {
    if (!obj || obj.max === 0) return "-";
    return `${obj.current || 0} / ${obj.max}`;
  });
  hbs.registerHelper("list", function () {
    const args = Array.prototype.slice.call(arguments);
    // 移除 Handlebars 自动传给助手的最后一个 options 对象
    args.pop();
    return args;
  });

  const logger = ctx.logger("skland");

  // 用户数据表
  ctx.model.extend("skland", {
    id: "string",
    token: "string",
    autoSign: { type: "boolean", initial: true },
  });
  // 角色表
  // ctx.model.drop("skland_role");
  ctx.model.extend(
    "skland_role",
    {
      userId: "string",
      roleId: "string",
      nickname: "string",
      channelName: "string",
      channelMasterId: "string",
      gameName: "string",
      serverId: "string",
    },
    { unique: [["userId", "roleId"]], primary: ["userId", "roleId"] },
  );
  // 终末地角色卡池数据表
  // await ctx.model.drop("skland_endfield_char_pool");
  ctx.model.extend(
    "skland_endfield_char_pool",
    {
      pool_id: "string",
      pool_gacha_type: "string",
      pool_name: "string",
      pool_type: "string",
      up6_name: "string",
      up6_image: "string",
      up5_name: "string",
      up5_image: "string",
      up6_item_name: "string",
      rotate_image: "string",
      rotate_list: "array",
      ticket_name: "string",
      ticket_ten_name: "string",
      all: "array",
    },
    { primary: "pool_id" },
  );
  // 终末地武器卡池数据表
  // await ctx.model.drop("skland_endfield_char_pool");
  ctx.model.extend(
    "skland_endfield_weapon_pool",
    {
      pool_id: "string",
      pool_gacha_type: "string",
      pool_name: "string",
      up6_name: "string",
      up6_image: "string",
      all: "list",
      link_char_pool_name: "string",
      gift_weapon_name: "string",
      gift_weapon_box_name: "string",
      gift_weapon_reward_name: "string",
      gift_content: "array",
    },
    { primary: "pool_id" },
  );
  // 终末地角色抽卡数据表
  // await ctx.model.drop("skland_endfield_char_gacha");
  ctx.model.extend(
    "skland_endfield_char_gacha",
    {
      userId: "string",
      poolId: "string",
      poolName: "string",
      category: "string",
      charId: "string",
      charName: "string",
      rarity: "integer",
      isFree: "boolean",
      isNew: "boolean",
      gachaTs: "string",
      seqId: "string",
    },
    { unique: [["userId", "seqId"]], primary: ["userId", "seqId"] },
  );
  // 终末地武器抽卡数据表
  // await ctx.model.drop("skland_endfield_weapon_gacha");
  ctx.model.extend(
    "skland_endfield_weapon_gacha",
    {
      userId: "string",
      poolId: "string",
      poolName: "string",
      category: "string",
      weaponId: "string",
      weaponName: "string",
      weaponType: "string",
      rarity: "integer",
      isNew: "boolean",
      gachaTs: "string",
      seqId: "string",
    },
    { unique: [["userId", "seqId"]], primary: ["userId", "seqId"] },
  );

  const checkUserBind = async (
    userId: string,
    unbindMessage: string = `未绑定森空岛信息，请使用 "skland bind <Token>" 或者 "skland bind qrcode" 进行绑定！`,
  ) => {
    const [userBind] = await ctx.database.get("skland", { id: userId });
    if (!userBind?.token) {
      throw new Error(unbindMessage);
    }
    return userBind;
  };

  const checkRole = async (userId: string, gameName: AppName) => {
    const role = await ctx.database.get("skland_role", { userId, gameName });
    return !!role.length;
  };

  // ctx.command("skland-user").action(async ({ session, options }) => {
  //   const skland = new Skland(config, ctx.http, logger);
  //   const playerInfo = await skland.getCardDetail();
  //   logger.info(playerInfo);
  // });

  // ctx.command("skland-test").action(async ({ session, options }) => {
  //   const messageId = session.messageId;
  //   const skland = new Skland(config, ctx.http, logger);
  //   const { userId, userBind } = await getUserBind(session);
  // });

  /**
   * 同步所有卡池信息
   * @returns 同步结果
   */
  const syncAllPools = async (isStart?: boolean) => {
    const skland = new Skland(config, ctx.http, logger);

    const getPools = async () => {
      try {
        return await skland.getEndfieldGachaPoolInfoFromGithub();
      } catch (error) {
        if (isStart) {
          logger.info(
            "从Github获取卡池信息失败，将使用本地数据，可能缺失部分卡池信息",
          );
          return poolsToMap(localGachaMap as GachaPoolGithub);
        } else {
          throw error;
        }
      }
    };
    const { charPools, weaponPools } = await getPools();

    const c = await ctx.database.upsert("skland_endfield_char_pool", charPools);
    const w = await ctx.database.upsert(
      "skland_endfield_weapon_pool",
      weaponPools,
    );
    const result = { ...c };
    for (const [key, value] of Object.entries(w)) {
      // 如果已存在则相加，不存在则直接赋值
      result[key] = (result[key] || 0) + value;
    }
    return result;
  };

  const startSyncAllPools = async () => {
    try {
      logger.info("执行启动时获取所有卡池信息");
      const res = await syncAllPools(true);
      logger.info(
        `获取卡池信息成功，新增${res.inserted}条，修改${res.modified}条`,
      );
    } catch (_) {
      logger.warn("获取卡池信息失败，可能会影响卡池分析渲染！");
    }
  };

  startSyncAllPools();

  ctx
    .command("skland.endfield.gacha [at:user]")
    .option("update", "-u")
    .alias("终末地抽卡分析")
    .action(async ({ session, options }, user) => {
      const messageId = session.messageId;
      const skland = new Skland(config, ctx.http, logger);
      try {
        const userId =
          user || `${session.event.platform}:${session.event.user.id}`;
        const hasRole = await checkRole(userId, "明日方舟：终末地");
        if (!hasRole)
          throw new Error("未绑定明日方舟：终末地角色，无法获取卡片信息！");
        const userBind = await checkUserBind(userId);
        // 更新抽卡信息
        if (options.update) {
          // 从数据库获取各卡池最大 seqId
          const charStats = await ctx.database
            .select("skland_endfield_char_gacha")
            .where({ userId })
            .groupBy("category", {
              maxSeq: (row) => $.max($.number(row?.seqId)),
            })
            .execute();
          const weaponStats = await ctx.database
            .select("skland_endfield_weapon_gacha")
            .where({ userId })
            .groupBy("category", {
              maxSeq: (row) => $.max($.number(row?.seqId)),
            })
            .execute();
          // 重组
          const categorySeq: GachaCategorySeq = {
            E_CharacterGachaPoolType_Beginner: 0,
            E_CharacterGachaPoolType_Standard: 0,
            E_CharacterGachaPoolType_Special: 0,
            Weapon: weaponStats[0]?.maxSeq || 0,
          };

          // 填充数值
          charStats.forEach(
            (item) => (categorySeq[item.category] = item?.maxSeq),
          );
          // 获取抽卡历史
          const gachaObj = await skland.getEndfieldGachaHistory(
            userBind.token,
            categorySeq,
          );

          /**
           * 统一处理不同的抽卡数据
           * @param table 表名
           * @param rawList 抽卡记录
           * @param defaultCategory 分类
           * @returns
           */
          const upsertGacha = async <
            T extends { seqId: string; poolId: string },
          >(
            table:
              | "skland_endfield_char_gacha"
              | "skland_endfield_weapon_gacha",
            rawList: T[],
          ) => {
            if (!rawList.length) return;

            const processed: T[] = rawList.map((gacha) => {
              // 自动判定分类逻辑
              let category = ENDFIELD_POOL_TYPE.WEAPON;
              if (gacha.poolId.startsWith("special")) {
                category = ENDFIELD_POOL_TYPE.SPECIAL;
              } else if (gacha.poolId === "standard") {
                category = ENDFIELD_POOL_TYPE.STANDARD;
              } else if (gacha.poolId === "beginner") {
                category = ENDFIELD_POOL_TYPE.BEGINNER;
              }

              return { ...gacha, category, userId };
            });

            return await ctx.database.upsert(table, processed, [
              "userId",
              "seqId",
            ]);
          };
          // 处理角色抽卡数据
          const characterWr = await upsertGacha(
            "skland_endfield_char_gacha",
            gachaObj.character,
          );
          // 处理武器抽卡数据
          const weaponWr = await upsertGacha(
            "skland_endfield_weapon_gacha",
            gachaObj.weapon,
          );
          await session.send([
            h.quote(messageId),
            h.text(
              `抽卡记录更新\n[干员]新增${characterWr.inserted || 0}条\n[武器]新增${weaponWr.inserted || 0}条`,
            ),
          ]);
        }

        // 获取角色卡池信息
        const charPoolList = await ctx.database.get(
          "skland_endfield_char_pool",
          {},
        );
        // 获取武器卡池信息
        const weaponPoolList = await ctx.database.get(
          "skland_endfield_weapon_pool",
          {},
        );
        // 获取角色抽卡记录
        const charGachaList = await ctx.database.get(
          "skland_endfield_char_gacha",
          { userId },
        );
        // 获取武器抽卡记录
        const weaponGachaList = await ctx.database.get(
          "skland_endfield_weapon_gacha",
          { userId },
        );

        // 检查是否有新池子
        const notExistCharIds = filterPoolId(charPoolList, charGachaList);
        const notExistWeaponIds = filterPoolId(weaponPoolList, weaponGachaList);

        if (notExistCharIds.length || notExistWeaponIds.length) {
          const { bindData } = await skland.getBindDataContext(userBind.token);
          let serverId: string;
          for (const app of bindData.data.list) {
            if (app.appCode === "endfield") {
              serverId = app.bindingList[0].defaultRole.serverId;
              break;
            }
          }

          for (const id of notExistCharIds) {
            const res = await skland.getEndfieldGachaPoolInfo<EndfieldCharPool>(
              id,
              serverId,
            );
            if (typeof res !== "number") {
              charPoolList.push({ pool_id: id, ...res.pool });
            } else {
              logger.warn(
                `ID为 ${id} 的卡池信息不存在（非当前UP池），会影响抽卡分析渲染效果！`,
              );
            }
          }
          const cwr = await ctx.database.upsert(
            "skland_endfield_char_pool",
            charPoolList,
          );

          for (const id of notExistWeaponIds) {
            const res =
              await skland.getEndfieldGachaPoolInfo<EndfieldWeaponPool>(
                id,
                serverId,
              );
            if (typeof res !== "number") {
              weaponPoolList.push({ pool_id: id, ...res.pool });
            } else {
              logger.warn(
                `ID为 ${id} 的卡池信息不存在（非当前UP池），会影响抽卡分析渲染效果！`,
              );
            }
          }
          const wwr = await ctx.database.upsert(
            "skland_endfield_char_pool",
            charPoolList,
          );
          await session.send([
            h.quote(messageId),
            h.text(
              `卡池数据更新\n[干员]新增${cwr.inserted || 0}条\n[武器]新增${wwr.inserted || 0}条`,
            ),
          ]);
        }

        // 重新组装卡池信息
        const poolMap: Record<
          string,
          SklandCharacterPoolSchedule | SklandWeaponPoolSchedule
        > = {};
        charPoolList.forEach((p) => (poolMap[p.pool_id] = p));
        weaponPoolList.forEach((p) => (poolMap[p.pool_id] = p));

        const userData = await skland.getCardDetail(userBind.token);

        const chars = userData.detail.chars;

        const charData = processEndfieldPool(charGachaList, { poolMap, chars });
        const weaponData = processEndfieldPool(weaponGachaList, {
          poolMap,
          chars,
        });

        const beginnerData = charData.filter(
          (c) => c.category === ENDFIELD_POOL_TYPE.BEGINNER,
        );
        const standardData = charData.filter(
          (c) => c.category === ENDFIELD_POOL_TYPE.STANDARD,
        );
        const specialData = charData
          .filter((c) => c.category === ENDFIELD_POOL_TYPE.SPECIAL)
          .reverse();

        const specialGacha = charGachaList.filter(
          (g) => g.category === ENDFIELD_POOL_TYPE.SPECIAL,
        );
        const standardGacha = charGachaList.filter(
          (g) => g.category === ENDFIELD_POOL_TYPE.STANDARD,
        );
        const beginnerGacha = charGachaList.filter(
          (g) => g.category === ENDFIELD_POOL_TYPE.BEGINNER,
        );

        const crystalJade = formatNumber(
          charGachaList.filter((g) => !g.isFree).length * 500,
        );

        const weaponQuota = formatNumber(
          charGachaList.reduce((acc, gacha) => {
            if (gacha.rarity === 6) return acc + 2000;
            if (gacha.rarity === 5) return acc + 200;
            return acc + 20;
          }, 0),
        );

        const useWeaponQuota = formatNumber(
          (weaponGachaList.length / 10) * 1920,
        );

        const card: EndfieldCard = {
          uid: userData.detail.base.roleId,
          name: userData.detail.base.name,
          avatarUrl: userData.detail.base.avatarUrl,
          crystalJade,
          weaponQuota,
          useWeaponQuota,
          gacha: {
            total: {
              character: charGachaList.length,
              weapon: weaponGachaList.length,
            },
            special: {
              ...getPoolInfo(
                specialData,
                charGachaList.filter(
                  (g) => g.category === ENDFIELD_POOL_TYPE.SPECIAL,
                ),
              ),
              stats: calculatePoolStats(specialGacha),
            },
            standard: {
              ...getPoolInfo(
                standardData,
                charGachaList.filter(
                  (g) => g.category === ENDFIELD_POOL_TYPE.STANDARD,
                ),
              ),
              stats: calculatePoolStats(standardGacha),
            },
            beginner: {
              ...getPoolInfo(
                beginnerData,
                charGachaList.filter(
                  (g) => g.category === ENDFIELD_POOL_TYPE.BEGINNER,
                ),
              ),
              stats: calculatePoolStats(beginnerGacha),
            },
            weapon: {
              ...getPoolInfo(weaponData.reverse(), weaponGachaList),
              stats: calculatePoolStats(weaponGachaList),
            },
          },
          pools: {
            BEGINNER: beginnerData,
            SPECIAL: specialData,
            STANDARD: standardData,
            WEAPON: weaponData,
          },
        };

        // 读取html模板并渲染
        const templateHtml = readFileSync(
          resolve(__dirname, "html/endfieldGacha.html"),
          "utf-8",
        );
        const template = hbs.compile(templateHtml);
        const finalHtml = template(card);

        return await ctx.puppeteer.render(finalHtml);
      } catch (err) {
        return [h.quote(messageId), h.text(`获取抽卡分析失败：${err.message}`)];
      }
    });

  ctx
    .command("skland.endfield.card  [at:user]")
    .alias("终末地卡片")
    .action(async ({ session, options }, user) => {
      const messageId = session.messageId;
      try {
        const userId =
          user || `${session.event.platform}:${session.event.user.id}`;
        const hasRole = await checkRole(userId, "明日方舟：终末地");
        if (!hasRole)
          throw new Error("未绑定明日方舟：终末地角色，无法获取卡片信息！");
        const skland = new Skland(config, ctx.http, logger);
        const userBind = await checkUserBind(userId);
        const data = await skland.getCardDetail(userBind.token);
        const card = buildEndfieldCardJson(data);

        const templateHtml = readFileSync(
          resolve(__dirname, "html/endfieldCard.html"),
          "utf-8",
        );
        const template = hbs.compile(templateHtml);
        const finalHtml = template(card);
        const image = await ctx.puppeteer.render(finalHtml);

        const base64 = image.replace('<img src="', "").replace('"/>', "");

        await session.send([h.quote(messageId), h.img(base64)]);
      } catch (err) {
        return [
          h.quote(messageId),
          h.text(`生成终末地卡片失败：${err.message}`),
        ];
      }
    });

  /**
   * 同步卡池信息
   */
  ctx
    .command("skland.endfield.gacha.sync")
    .alias("同步终末地卡池信息")
    .action(async ({ session, options }) => {
      const messageId = session.messageId;
      try {
        const res = await syncAllPools();
        return [
          h.quote(messageId),
          h.text(
            `同步卡池信息成功，新增${res.inserted}条，修改${res.modified}条`,
          ),
        ];
      } catch (err) {
        return [h.quote(messageId), h.text(`同步卡池信息失败：${err.message}`)];
      }
    });

  /**
   * 二维码登录绑定Token
   */
  ctx
    .command("skland.bind.qrcode")
    .alias("森空岛二维码绑定")
    .action(async ({ session, options }) => {
      const messageId = session.messageId;
      try {
        const userId = `${session.event.platform}:${session.event.user.id}`;
        const user = await ctx.database.get("skland", { id: userId });
        if (user.length) {
          return [
            h.quote(messageId),
            h.text("已绑定过账号，如需重新绑定请先解绑！"),
          ];
        }

        const skland = new Skland(config, ctx.http, logger);
        const { scanId, scanUrl } = await skland.getQrcode();

        if (config.debug) logger.info(`[扫码绑定] scanUrl: ${scanUrl}`);

        const url = await qrcode.toDataURL(scanUrl);

        await session.send([
          h.quote(messageId),
          h.img(url),
          h.text(
            "请使用森空岛app扫描二维码绑定账号\n二维码有效时间2分钟，请不要扫描他人的登录二维码进行绑定~",
          ),
        ]);
        const scanCode = await skland.checkQrcodeStatus(scanId, (status) => {
          if (status === 101) {
            session.send([h.quote(messageId), h.text(`已扫码，等待确认登录`)]);
          }
        });
        const token = await skland.getTokenByScanCode(scanCode);
        await handleBind(session, token);
      } catch (err) {
        return [h.quote(messageId), h.text(`绑定失败：${err.message}`)];
      }
    });

  /**
   * 手动绑定Token
   */
  ctx
    .command("skland.bind <token:string>")
    .alias("森空岛绑定")
    .action(async ({ session, options }, token) => {
      const messageId = session.messageId;
      if (!token) {
        return [h.quote(messageId), h.text("Token不能为空！")];
      }
      const userId = `${session.event.platform}:${session.event.user.id}`;
      const user = await ctx.database.get("skland", { id: userId });
      if (user.length) {
        return [
          h.quote(messageId),
          h.text("已绑定过账号，如需重新绑定请先解绑！"),
        ];
      }
      await handleBind(session, token);
    });

  // 绑定角色
  const handleBind = async (session: Session, token: string) => {
    const messageId = session.messageId;
    const userId = `${session.event.platform}:${session.event.user.id}`;
    const skland = new Skland(config, ctx.http, logger);
    const roles = await skland.getBindData(token);
    // 限制一个游戏只能一个角色
    const bindRoles: SklandRoleSchedule[] = [];
    const arknights = roles
      .filter((r) => r.gameName === "明日方舟")
      .map((r) => ({ ...r, userId }));
    if (arknights.length > 1) {
      const role = arknights
        .map((r, i) => `${i + 1}.${r.nickname}(${r.channelName})`)
        .join("\n");
      await session.send([
        h.quote(messageId),
        h.text("检测到存在多个明日方舟角色，请选择要绑定的角色：\n"),
        h.text(role),
        h.text("请在60秒内回复对应数字进行选择，或者回复0取消绑定明日方舟角色"),
      ]);
      const select = await session.prompt(600000);
      const s = parseInt(select);
      if (s !== 0 && s <= arknights.length) {
        await ctx.database.upsert("skland_role", [arknights[s - 1]]);
        bindRoles.push(arknights[s - 1]);
      }
    } else {
      await ctx.database.upsert("skland_role", arknights);
      bindRoles.push(...arknights);
    }
    const endfields = roles
      .filter((r) => r.gameName === "明日方舟：终末地")
      .map((r) => ({ ...r, userId }));
    if (endfields.length > 1) {
      const role = endfields
        .map((r, i) => `${i + 1}.${r.nickname}(${r.channelName})`)
        .join("\n");
      await session.send([
        h.quote(messageId),
        h.text("检测到存在多个明日方舟：终末地角色，请选择要绑定的角色：\n"),
        h.text(role),
        h.text("请在60秒内回复对应数字进行选择，或者回复0取消绑定明日方舟角色"),
      ]);
      const select = await session.prompt(600000);
      const s = parseInt(select);
      if (s !== 0 && s <= endfields.length) {
        await ctx.database.upsert("skland_role", [endfields[s - 1]]);
        bindRoles.push(endfields[s - 1]);
      }
    } else {
      await ctx.database.upsert("skland_role", endfields);
      bindRoles.push(...endfields);
    }
    if (bindRoles.length) {
      await ctx.database.upsert("skland", [{ id: userId, token }]);
      const roleText = bindRoles
        .map(
          (r, i) => `${i + 1}.${r.gameName}: ${r.nickname} (${r.channelName})`,
        )
        .join("\n");
      await session.send([
        h.quote(messageId),
        h.text("绑定成功：\n"),
        h.text(roleText),
      ]);
    } else {
      await session.send([
        h.quote(messageId),
        h.text("绑定失败：未找到相应的游戏角色！"),
      ]);
    }
  };

  /**
   * 解绑
   */
  ctx
    .command("skland.unbind")
    .alias("森空岛解绑")
    .action(async ({ session, options }) => {
      const messageId = session.messageId;
      try {
        const userId = `${session.event.platform}:${session.event.user.id}`;
        await checkUserBind(userId, "未绑定森空岛信息，无需解绑！");
        await ctx.database.remove("skland", { id: userId });
        await ctx.database.remove("skland_role", { userId });
        return [h.quote(messageId), h.text("解绑成功")];
      } catch (err) {
        return [h.quote(messageId), h.text(`解绑失败：${err.message}`)];
      }
    });

  /**
   * 解绑
   */
  ctx
    .command("skland.autoSign")
    .option("enabled", "-e")
    .option("disabled", "-d")
    .alias("森空岛自动签到")
    .action(async ({ session, options }) => {
      const messageId = session.messageId;
      try {
        const userId = `${session.event.platform}:${session.event.user.id}`;
        const userBind = await checkUserBind(userId);
        if (options.enabled) {
          await ctx.database.set("skland", { id: userId }, { autoSign: true });
          return [h.quote(messageId), h.text("已启用自动签到")];
        } else if (options.disabled) {
          await ctx.database.set("skland", { id: userId }, { autoSign: false });
          return [h.quote(messageId), h.text("已禁用自动签到")];
        } else {
          const status = userBind.autoSign;
          await ctx.database.set(
            "skland",
            { id: userId },
            { autoSign: !status },
          );
          return [
            h.quote(messageId),
            h.text(`已${status ? "禁用" : "启用"}自动签到`),
          ];
        }
      } catch (err) {
        return [
          h.quote(messageId),
          h.text(`启用/禁用自动签到失败：${err.message}`),
        ];
      }
    });

  if (ctx.cron) {
    ctx.cron(config.cron, async () => {
      // 获取所有用户
      const userList = await ctx.database.get("skland", { autoSign: true });
      const skland = new Skland(config, ctx.http, logger);
      for (const user of userList) {
        let text = `========== ${user.id} 签到结果 ==========`;
        text += await skland.sign(user.token);
        logger.info(text);
      }
    });
  }
}
