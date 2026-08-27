export interface ExtensionConfig {
  enterToSend: boolean;
  ctrlEnterToNewline: boolean;
  shiftEnterToNewline: boolean;
  imeProtection: boolean; // Prevent send during Chinese/Japanese pinyin composition
  showSendBadge: boolean;
  matchPatterns: string[];
}

export interface FileItem {
  filename: string;
  language: string;
  description: string;
  content: string;
}
