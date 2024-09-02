---
title: Identify When To Use Threading Operators
sequence: 3
---

Given a deeply nested function with multiple arguments, how can
threading macros improve both readability and maintainability?

For example:

```clojure
(j arg3 (h (f (g x) arg1) arg2) arg4)
```

Deeply nesting function calls can lead to a handful of difficult to answer questions:

- What is the execution order of these functions?
- Which function is `arg1` being supplied to? What about `arg2`?
- How easily would you be able to visually verify execution order?
- How easily would you be able to refactor or introduce additional arguments as APIs change?

When choosing to introduce a threading macro into your code, ask yourself the following:

- Am I improving the readability of this code?
- Will the maintainability of the code increase from the use of threading macros?

If you answer "yes" to either of these questions, you have a good
candidate for using a threading macro.

Use your best judgment when deciding to use any of the threading
macros available to you as threading is not _always_ appropriate.

Consider the following example:

```clojure
(defn make-odd
  "When i is even, return the next odd integer else i."
  [i]
  (cond-> i (even? i) inc))
```

While this function is small, a single line for that matter, it is
arguably more difficult to reason about due to the use of `cond->`. A
new Clojure developer may struggle to understand this code if they do
not understand `cond->`.

A better solution _may_ be to use `if`:

```clojure
(defn make-odd
  "When i is even, return the next odd integer else i."
  [i]
  (if (even? i)
    (inc i)
    i))
```