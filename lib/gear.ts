export interface GearItem {
  id: string;
  name: string;
  category: string;
  image: string;
  description: string;
  specs?: Record<string, string>;
  link_official?: string;
  link_amazon?: string;
  link_rakuten?: string;
  published?: boolean;
}

// Data is now managed in content/my-gear/*.mdx and fetched via lib/gear-data.ts
// export const gearItems: GearItem[] = ... 
