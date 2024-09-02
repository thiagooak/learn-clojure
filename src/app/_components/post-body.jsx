import CodeBlock from "./code-block";

export default function PostBody({ content }) {
  return (
    <div>
        {content.map((c, i) => {
            if (c.html) {
                return (<div key={i} dangerouslySetInnerHTML={{__html: c.html}}/>)
            }
            if (c.code) {
                const allowEval = c.code.lang !== "clojureevaloff";
                const lang = c.code.lang === "clojureevaloff" ? "clojure" : c.code.lang;
                return (<CodeBlock key={i} language={lang} allowEval={allowEval}>{c.code.content}</CodeBlock>)
            }})}
    </div>
  );
}
