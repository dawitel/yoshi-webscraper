export interface CSVData {
  Identity: string;
  eBayURL: string;
  Currency: string | undefined;
  Rank: number;
}

export interface getcurrencyCodeParams {
  currencySymbol: string | undefined
}

export interface EmailerProps {
  Data?: any,
  ErrorTo?: string
}