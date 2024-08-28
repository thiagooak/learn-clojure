import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

const dir = join(process.cwd(), "_chapters");

export function getChapterSlugs() {
  return fs.readdirSync(dir);
}

export function getChapterBySlug(slug) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(dir, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return { ...data, slug: realSlug, content };
}

export function getAllChapters() {
  const slugs = getChapterSlugs();
  const posts = slugs
    .map((slug) => getChapterBySlug(slug))
    .sort((a, b) => (a.sequence > b.sequence ? 1 : -1));
  return posts;
}
