// Common device viewport presets

export interface DevicePreset {
  name: string;
  width: number;
  height: number;
}

export const DEVICE_PRESETS: Record<string, DevicePreset> = {
  // Mobile devices
  "iphone-15-pro": { name: "iPhone 15 Pro", width: 393, height: 852 },
  "iphone-15-pro-max": { name: "iPhone 15 Pro Max", width: 430, height: 932 },
  "iphone-se": { name: "iPhone SE", width: 375, height: 667 },
  "pixel-7": { name: "Google Pixel 7", width: 412, height: 915 },
  "galaxy-s23": { name: "Samsung Galaxy S23", width: 360, height: 780 },
  
  // Tablets
  "ipad-mini": { name: "iPad Mini", width: 744, height: 1133 },
  "ipad-air": { name: "iPad Air", width: 820, height: 1180 },
  "ipad-pro-11": { name: 'iPad Pro 11"', width: 834, height: 1194 },
  "ipad-pro-13": { name: 'iPad Pro 13"', width: 1024, height: 1366 },
  
  // Desktop
  "desktop-1080p": { name: "Desktop 1080p", width: 1920, height: 1080 },
  "desktop-1440p": { name: "Desktop 1440p", width: 2560, height: 1440 },
  "macbook-air": { name: "MacBook Air", width: 1440, height: 900 },
  "macbook-pro-14": { name: 'MacBook Pro 14"', width: 1512, height: 982 },
};
