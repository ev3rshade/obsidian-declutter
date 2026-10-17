// rules-api.ts defines the types and functions shared by all rule files

export interface Rule {
  name: string;
  filter: (file: TFile) => boolean;
}
