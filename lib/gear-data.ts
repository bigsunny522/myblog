import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { GearItem } from '@/lib/gear';

const gearDirectory = path.join(process.cwd(), 'content/my-gear');

export function getAllGearItems(): GearItem[] {
  // Check if directory exists
  if (!fs.existsSync(gearDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(gearDirectory);
  const allGearData = fileNames.map((fileName) => {
    // Remove ".mdx" from file name to get id
    const id = fileName.replace(/\.mdx$/, '');

    // Read markdown file as string
    const fullPath = path.join(gearDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const { data, content } = matter(fileContents);

    // Combine the data with the id
    return {
      id,
      name: data.name,
      category: data.category,
      image: data.image,
      description: content.trim(), // Use the content body as description
      specs: data.specs,
      link_official: data.link_official,
      link_amazon: data.link_amazon,
      link_rakuten: data.link_rakuten,
      published: data.published !== false, // Default to true
    } as GearItem;
  }).filter((item) => item.published !== false);

  return allGearData;
}
