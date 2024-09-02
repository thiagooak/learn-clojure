---
title: Threading Operators
sequence: 6
---

## Objectives

- Understand function call-chaining
- Refactor deeply nested function calls
- Explore different threading operators
- Identify when to use threading operators

## Overview

In this module you will discover a powerful set of Clojure macros that can improve readability and maintainability of your code.

> Threading macros, also known as arrow macros, convert nested
> function calls into a linear flow of function calls, improving
> readability.

Before learning how and when to apply a threading macro, first understand the problems they are solving.

## Summary

In this module you have learned how deeply nesting function calls can
diminish code readability and what tools Clojure provides to help you
mitigate it. Examples of _nearly_ all threading macros were provided
and you have the knowledge to choose when to use a threading macro.

See the [Extra Credit](#extra-credit) section below to learn what
exactly Clojure is doing when it sees a threading macro.

### Extra Credit

You can quickly and easily ask Clojure to expand a macro into the
source code it returns, without evaluation.

Take the function body of your `hire` final implementation and prepend
a `'` ([quote](https://clojuredocs.org/clojure.core/quote)). This will
instruct the reader to not attempt to evaluate the form. Once you have
the un-evaluated form, you can get the macro output:

```clojure
(def hire-impl
   '(-> employee
        (assoc :email (str (:first-name employee) "@nubank.com.br"))
        (update :employment-history conj "Nubank")
        (assoc :hired-at (java.util.Date.))))

(macroexpand hire-impl)
;; => (assoc (update (assoc employee :email (str (:first-name employee) "@nubank.com.br")) :employment-history conj "Nubank") :hired-at (java.util.Date.))
```

This looks _a lot_ like your original implementation for `hire`! See [macroexpand](https://clojuredocs.org/clojure.core/macroexpand).

## Resources

- [Clojure.org Threading Macros Guide](https://clojure.org/guides/threading_macros)
- [Clojure Docs ->](https://clojuredocs.org/clojure.core/-%3E)
- [Clojure Docs ->>](https://clojuredocs.org/clojure.core/-%3E%3E)
- [Clojure Docs some->](https://clojuredocs.org/clojure.core/some-%3E)
- [Clojure Docs cond->](https://clojuredocs.org/clojure.core/cond-%3E)
- [Clojure Docs as->](https://clojuredocs.org/clojure.core/as-%3E)
- [Clojure Style Guide](https://github.com/bbatsov/clojure-style-guide#threading-macros)
