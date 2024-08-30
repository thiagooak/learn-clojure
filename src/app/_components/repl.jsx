"use client"
import {useState} from "react"

// @TODO move this to react-interactive-cljs
export default function Repl() {
    const [input, setInput] = useState(`(println "Hello World!")`);
    const [output, setOutput] = useState("")

    function handleChange(e) {
        setInput(e);
    }

    function handleSubmit(e) {
        e.preventDefault();
        setOutput(output.concat(input).concat("\n")) // @TODO use evaluae from eval-cljs
        // let [evalOutput, printOutput] = evaluate(x);
        // setOutput(printOutput.concat(evalOutput).join("\n"))
    }

    return (<>
        <div className="px-2 py-1 h-3/4 max-h-3/4">{output.split("\n").map((o, i) => (<div key={i}>{o}</div>))}</div>
        <form onSubmit={(e) => handleSubmit(e)} className="flex-row sm:flex px-2 sm:h-1/4">
            <textarea className="w-full h-full p-1 bg-gray-800" spellCheck={false} onChange={(e) => handleChange(e)}>{input}</textarea>
            <input type="submit" className="rounded bg-blue-600 py-1 px-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" value="Enter" />
        </form>
        </>
      );
  }