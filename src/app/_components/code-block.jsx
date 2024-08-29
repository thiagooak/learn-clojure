"use client"
import { CodeBlock as CljsCodeBlock } from "react-interactive-cljs"

const CodeBlock = ({ children, ...props }) => {
return (
    <CljsCodeBlock {...props}>{children}</CljsCodeBlock>
);
};

export default CodeBlock;
