import { notFound } from "next/navigation";
import { getAllChapters, getChapterBySlug } from "@/lib/api";
import markdownToHtml from "@/lib/markdownToHtml";
import PostBody from "@/app/_components/post-body";

export default async function Chapter({ params }) {
  const allChapters = getAllChapters();
  const chapter = getChapterBySlug(params.slug);

  if (!chapter) {
    return notFound();
  }

  const content = await markdownToHtml(chapter.content || "");

  return (
    <main className="flex p-4">
        <div>
            <ul>
            {allChapters.map((p) => {
                return <li key={p.slug}><a href={`/chapters/${p.slug}`}>{p.title}</a></li>
            })}
            </ul>
        </div>
        <div className="max-w-2xl mx-auto prose lg:prose-xl">
            <h1>{chapter.title}</h1>
            <PostBody content={content}></PostBody>
        </div>

    </main>
  );
}

export function generateMetadata({ params }) {
  const chapter = getChapterBySlug(params.slug);

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
    slug: chapter.slug,
  }));
}
