import dayjs from "dayjs";

export const formatTs = (ts: string, format: string = "YYYY-MM-DD HH:mm") => {
  const ms = Number(ts);
  return dayjs(ms * 1000).format(format);
};
