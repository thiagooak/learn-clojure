"use client"
import {Repl as OriginalRepl}  from "react-interactive-cljs"

// @TODO move this to react-interactive-cljs
export default function Repl() {
    return (<OriginalRepl defaultInput={`"Hello, World!"`}></OriginalRepl>)

  }