import CodeBlock from "./code-block";

export default function PostBody({ content }) {
  return (
    <div>
        {content.map((c) => {
            if (c.html) {
                return (<div
                    dangerouslySetInnerHTML={{__html: c.html}}
                />)
            }

            if (c.code) {
                return (<CodeBlock>{c.code}</CodeBlock>)
            }

            })}
    </div>
  );
}
