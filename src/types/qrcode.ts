export interface QrcodeData {
  scanId: string;
  scanUrl: string;
  enableScanAppList: [{ appCode: string; name: string; iconUrl: string }];
}

export interface QrcodeStatusData {
  scanCode: string;
}
