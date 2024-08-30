import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

const dir = join(process.cwd(), "_chapters");

function getChapterFiles() {
  return fs.readdirSync(dir, {recursive: true});
}

export function getChapter(chapter, part) {
  const slug = `${chapter}/${part}`
  const fullPath = join(dir, `${slug}.md`)
  const fileContents = fs.readFileSync(fullPath, "utf8")
  const { data, content } = matter(fileContents)

  return { ...data, slug, content };
}

function getChapterByPath(path) {
  const [chapter, part] = path.replace(/\.md$/, "").split("/");

  return getChapter(chapter, part ?? 'readme');
}

export function getAllChapters() {
  const paths = getChapterFiles().filter((name) => name.endsWith(".md"));

  const chapters = paths
    .map((path) => getChapterByPath(path))
    .sort((a, b) => (a.sequence > b.sequence ? 1 : -1));

  return chapters;
}

export function getChaptersTree() {
  const files = getChapterFiles()
  const pages = files.filter((name) => name.endsWith(".md"))
    .filter((name) => !name.endsWith("readme.md")) // dirs link to the readme, so skip them
  const dirs  = files.filter((name) => !name.endsWith(".md"))

  return dirs.map((dir) => {
    return {
      dir: getChapterByPath(dir),
      pages: pages.filter((page) => page.startsWith(dir))
        .map((slug) => getChapterByPath(slug))
        .sort((a, b) => (a.sequence > b.sequence ? 1 : -1))
    }
  }).sort((a, b) => (a.dir.sequence > b.dir.sequence ? 1 : -1))
}
