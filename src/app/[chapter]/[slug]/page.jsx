import { notFound } from "next/navigation";
import { getAllChapters, getChapter, getChaptersTree } from "@/lib/api";
import markdownToHtml from "@/lib/markdownToHtml";
import PostBody from "@/app/_components/post-body";
import Repl from "@/app/_components/repl";
import Nav from "@/app/_components/nav";

export const dynamicParams = false

export default async function Chapter({ params }) {
  const chapter = getChapter(params.chapter, params.slug);

  if (!chapter) {
    return notFound();
  }

  const nestedChapters = getChaptersTree();
  const content = await markdownToHtml(chapter.content || "");

  return (
    <main className="flex">
        <div className="w-1/6 p-4 max-h-screen overflow-scroll">
            <Nav nestedChapters={nestedChapters} />
        </div>
        <div className="w-3/6 max-h-screen overflow-scroll">
          <div className="max-w-2xl p-4 mx-auto prose lg:prose-xl">
              <h1>{chapter.title}</h1>
              <PostBody content={content}></PostBody>
              <div className="text-right">
              {chapter.next && (<a href={chapter.next}>Next &gt;</a>)}
              </div>
          </div>
        </div>
        <Repl></Repl>
    </main>
  );
}

export function generateMetadata({ params }) {
  const chapter = getChapter(params.chapter, params.slug);

  if (!chapter) {
    return notFound();
  }

  const title = `${chapter.title} | Learn Clojure`;

  return {
    title,
    openGraph: {
      title,
      images: [chapter?.ogImage?.url ?? ''],
    },
  };
}

export async function generateStaticParams() {
  const chapters = getAllChapters();

  return chapters.map((chapter) => ({
    chapter: chapter.slug.split("/")[0],
    slug: chapter.slug.split("/")[1],
  }));
}
