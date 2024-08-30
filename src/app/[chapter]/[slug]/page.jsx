import { notFound } from "next/navigation";
import { getAllChapters, getChapter, getChaptersTree } from "@/lib/api";
import markdownToHtml from "@/lib/markdownToHtml";
import PostBody from "@/app/_components/post-body";
import Repl from "@/app/_components/repl";

function NavPart({path, title}) {
  return (<li><a href={`/${path}`}>{title}</a></li>)
}

function NavChapter({path, title, children}) {
  return (<li>
    <a href={`/${path}`}>{title}</a>
    <ul className="ml-4">
      {children}
    </ul>
  </li>);
}

export default async function Chapter({ params }) {
  const nestedChapters = getChaptersTree();
  const chapter = getChapter(params.chapter, params.slug);

  if (!chapter) {
    return notFound();
  }

  const content = await markdownToHtml(chapter.content || "");

  return (
    <main className="flex">
        <div className="w-1/6 p-4">
            <ul>
              {nestedChapters.map((chapter) =>
                (<NavChapter key={chapter.dir.slug} path={chapter.dir.slug} title={chapter.dir.title}>
                  {chapter.pages.map((page) => (<NavPart key={page.slug} path={page.slug} title={page.title} ></NavPart>))}
                </NavChapter>))}
            </ul>
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

        <div className="w-2/6 min-w-80 bg-slate-800 text-white p-4 max-h-screen min-h-screen h-screen bg-black text-white overflow-scroll scroll-smooth">
          <Repl></Repl>
        </div>

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
    slug: chapter.slug,
  }));
}
