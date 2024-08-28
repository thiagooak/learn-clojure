"use client"
import { CljsCodeBlock } from "react-interactive-cljs"

const CodeBlock = ({ children }) => {
return (
    <CljsCodeBlock>{children}</CljsCodeBlock>
);
};

export default CodeBlock;
