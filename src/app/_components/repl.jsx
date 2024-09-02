"use client"
import {Repl as OriginalRepl}  from "react-interactive-cljs"

// @TODO move this to react-interactive-cljs
export default function Repl() {
    return (
        <div className="repl-wrapper">
            <OriginalRepl
        defaultInput={`"Hello, World!"`}
        outputClass = "repl-output"
        formClass = "repl-form"
        textareaClass = "repl-textarea"
        submitClass = "repl-submit"
         />
         </div>)

  }