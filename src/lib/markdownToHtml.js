import { remark } from "remark";
import html from "remark-html";

export default async function markdownToHtml(markdown) {
    const re = /`{3}([a-z]*)([^`]*)`{3}/g //```(language)(content)```
    const matches = [...markdown.matchAll(re)]
    const parts = markdown.replaceAll(re, "---CODE-BLOCK-PLACEHOLDER---").split("---CODE-BLOCK-PLACEHOLDER---")

    let result = []
    await parts.forEach(async e => {
        result.push({"html": (await remark().use(html).process(e)).toString()})
        if (matches.length > 0) {
            const codeBlock = matches.shift();
            result.push({
                "code": {
                    lang: codeBlock[1],
                    content: codeBlock[2].trim()
                }})
        }
    });

    return result;
}
