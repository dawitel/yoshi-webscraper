export interface CSVData {
  Identity: string;
  eBayURL: string;
  Rank: number;
  JPRank: number;
  Prices: string;
  JPPrices: string
  // Prices: string;

  Currency: string | undefined;
}

export interface getcurrencyCodeParams {
  currencySymbol: string | undefined
}

export interface EmailerProps {
  Data?: any,
  ErrorTo?: string
}

export interface FileData {
  fileName: string;
  downloadUrl: string;
}

export interface EmailerResponse<T> {
  data: T | null;
  error: {
    message: string;
    name: string;
  } | null;
}

export interface EmailerV2Props {
  Data?: any[];
  ErrorTo?: string;
  Subject?: string;
  From?: string;
  To?: string;
  FirstName?: string;
  AttachmentsName?: string;
  ErrorSubject?: string;
}
