function NavPart({path, title}) {
    return (<li><a href={`/${path}`} className="hover:underline text-sm">{title}</a></li>)
  }

function NavChapter({path, title, children}) {
    return (<li>
        <a href={`/${path}`} className="hover:underline">{title}</a>
        <ul className="ml-4">
        {children}
        </ul>
    </li>);
}

export default function Nav({nestedChapters}) {
  return (
    <ul>
        {nestedChapters.map((chapter) =>
        (<NavChapter key={chapter.dir.slug} path={chapter.dir.slug} title={chapter.dir.title}>
            {chapter.pages.map((page) => (<NavPart key={page.slug} path={page.slug} title={page.title} ></NavPart>))}
        </NavChapter>))}
    </ul>
  );
}
