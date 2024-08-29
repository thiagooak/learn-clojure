---
title: "Getting Started"
sequence: 1
---

One of the best ways to learn a new programming language is to just try things out. This is why many programming environments come equipped with a facility that lets you type in some code and see what happens. In Clojure, this facility is the REPL.

REPL is both an acronym and an algorithm. It stands for "Read Evaluate Print Loop," which is exactly what it does. The REPL is an environment where everything you type is evaluated, its results are printed, and then it loops, ready for you to type the next instructions. You don't need to add a bunch of `(println "HERE!")` to your code.

If you have Clojure installed, you start a REPL by running `clj` from your terminal. You can also try an [online version of the Clojure REPL](https://tryclojure.org/).

The REPL may look like a fancy terminal. It is much more than that. We'll cover the REPL in detail when we get to chapter TBD (REPL-driven development).

This website features interactive code blocks that allow you to run Clojure code as you read the content. Try clicking the "Play" button right after the code below.
```clojure
(println "Hello World")
```