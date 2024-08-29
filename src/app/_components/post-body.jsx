import CodeBlock from "./code-block";

export default function PostBody({ content }) {
  return (
    <div>
        {content.map((c, i) => {
            if (c.html) {
                return (<div key={i} dangerouslySetInnerHTML={{__html: c.html}}/>)
            }
            if (c.code) {
                return (<CodeBlock key={i} language={c.code.lang}>{c.code.content}</CodeBlock>)
            }})}
    </div>
  );
}
