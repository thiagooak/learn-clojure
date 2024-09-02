# Learn Clojure

To run in dev
```sh
npm install
npm run dev
```

* Chapters are folders under `_chapters`
* `_chapters/[chapter]/readme.md` defines the first page of the chapter
    * sequence of the readme defines the order of the chapters
* `_chapters/[chapter]/[part].md` defines the rest of the parts of the chapter

```
---
title: "Chapter or Part Title"
sequence: 1
---
```

For runnable Clojure code blocks use:

````
```clojure
"Hello, World!"
```
````

For non-runnable Clojure code blocks use:

````
```clojureevaloff
"Hello, World!"
```
````
