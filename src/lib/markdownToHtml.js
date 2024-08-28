import { remark } from "remark";
import html from "remark-html";

export default async function markdownToHtml(markdown) {
    const placeholder = "---CODE-PLACEHOLDER---"
    const re = /`{3}clojure[^`]*`{3}/g
    const allMatches = [...markdown.matchAll(re)]
    const withPlaceholders = markdown.replaceAll(re, placeholder)
    const parts = withPlaceholders.split(placeholder)

    let result = []
    await parts.forEach(async e => {
        result.push({"html": (await remark().use(html).process(e)).toString()})
        if (allMatches.length > 0) {
            const codeBlock = allMatches.shift()[0];
            result.push({"code": codeBlock.replace("```clojure", "").replace("```", "").trim()})
        }
    });
    return result;
}
