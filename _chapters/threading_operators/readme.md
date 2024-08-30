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

## Understand Function Call-Chaining

Function call-chaining is the invocation of a function with the result of a previous invocation. Simply put, it is _deeply nested function calls_.

In the most simplistic form, `f(g(x))` is the _chained_ or _nested_ invocation of `f` with the result of `g(x)`.

In Clojure, you would write this _chain_ of function calls using [prefix notation](https://en.wikipedia.org/wiki/Polish_notation#Computer_programming):

```clojure
(f (g x))
```

While nesting exactly two function calls is arguably easy to read even without any threading, the cognitive burden scales as the chain grows and function arguments are added.

## Refactor Deeply Nested Function Calls

You are tasked with creating a function to record information about a new employee at Nubank. Your function will accept a map of key-value pairs. You can assume the employee map already contains the following:

- `:first-name` - String
- `:last-name` - String
- `:employment-history` - possibly empty Vector of Strings

Your function should:

- `assoc` the employee assigned `:email` address
- `update` the `:employment-history` vector and append `"Nubank"`
- `assoc` a `:hired-at` datetime

Let's try some different approaches to implement this function.

### Nested Function Calls

```clojure
(defn hire
  [employee]
  (assoc (update (assoc employee :email (str (:first-name employee) "@nubank.com.br")) :employment-history conj "Nubank") :hired-at (java.util.Date.)))
```

You can clean this up with some formatting:

```clojure
(defn hire
  [employee]
  (assoc (update (assoc employee
                        :email (str (:first-name employee) "@nubank.com.br"))
                 :employment-history conj "Nubank")
         :hired-at (java.util.Date.)))
```

Better, but there are other ways to make it even cleaner.

### Intermediate Value Binding

```clojure
(defn hire
  [employee]
  (let [email (str (:first-name employee) "@nubank.com.br")
        employee-with-email (assoc employee :email email)
        employee-with-history (update employee-with-email :employment-history conj "Nubank")]
    (assoc employee-with-history :hired-at (java.util.Date.))))
```

If only there was an easier way! You don't need the `let` bindings. Naming them was tedious, and there is a lot of crud complicating the implementation of your function.

### Thread First `->`

Using the `->` macro, you can more closely mirror your function's requirement specification, remove the need to introduce intermediate bindings, and greatly increase the readability.

The thread first macro (`->`) will take the first expression, place it in the second position of the following form, and repeat this process with each form in the body of the macro. Thread "first" is the first argument position.

```clojure
(defn hire
  [employee]
  (-> employee
      (assoc :email (str (:first-name employee) "@nubank.com.br"))
      (update :employment-history conj "Nubank")
      (assoc :hired-at (java.util.Date.))))

(hire {:first-name "Rich" :last-name "Hickey" :employment-history ["Cognitect"]})
;; => {:first-name "Rich",
;;     :last-name "Hickey",
;;     :employment-history ["Cognitect" "Nubank"],
;;     :email "Rich@nubank.com.br",
;;     :hired-at #inst "2022-05-20T19:41:54.498-00:00"}
```

Much better! You can quickly see exactly what this function is doing and
the order in which it is doing it. You are also more easily able to refactor it if you need to.

To show the usefulness of the thread last (`->>`) macro and how it can improve readability of functions operating on collections, let's look at another example.

The HR (Human Resources) department noticed that employees with
identical first names were being assigned the same email address. To
avoid this in the future, you first update your `hire` implementation
to use the template `<first-name>.<last-name>@nubank.com.br` when
generating an employee email address. As a follow up to your fix, HR
has a new request:

Find all current employees with email addresses _not_ following the
new format and send them CSVs with the new employee data: one file
for each day a set of employees were hired. In this example, we will
omit the CSV generation and only implement a function that returns a
list of vectors:

- Iterate over a collection of hired employees
- Filter for only employees with the old, incorrect, email format
- Update the email address to use the new format
- Return a list of employees affected - one list per day of hire

```clojure
;; Current DB of hired employees
(def employees
  [{:first-name "A" :last-name "B" :email "A@nubank.com.br" :hired-at #inst "2022-05-20"}
   {:first-name "C" :last-name "D" :email "C@nubank.com.br" :hired-at #inst "2022-05-21"}
   {:first-name "E" :last-name "F" :email "E@nubank.com.br" :hired-at #inst "2022-05-21"}

   ;; Your fix was implemented and deployed here

   {:first-name "G" :last-name "H" :email "G.H@nubank.com.br" :hired-at #inst "2022-05-21"}
   {:first-name "I" :last-name "J" :email "I.J@nubank.com.br" :hired-at #inst "2022-05-22"}])

(defn email-address
  "Return email address containing first and last name."
  [employee]
  (format "%s.%s@nubank.com.br"
          (:first-name employee)
          (:last-name employee)))

(defn old-email-format?
 "Return true when employee email does not follow the new format."
 [employee]
 (not= (:email employee) (email-address employee)))

(defn hired-day
  "Return the day of hire from :hired-at."
  [employee]
  (.getDay (:hired-at employee)))
```

### Nested Function Calls

```clojure
(defn report
  [employees]
  (vals (group-by hired-day (map #(assoc % :email (email-address %)) (filter old-email-format? employees)))))
```

Our `report` implementation does exactly what it needs to do but
suffers from the same issues as `hire`: it's very difficult to read
and is prone to errors if you ever need to refactor it. Let's skip
the formatting and intermediate binding and jump straight to thread
last (`->>`):

### Thread Last `->>`

Thread last is _nearly_ identical to thread first (`->`) except
expressions are threaded into the last argument position. This is very
useful when working with collections.

```clojure
(defn report
  [employees]
  (->> employees
       (filter old-email-format?)
       (map #(assoc % :email (email-address %)))
       (group-by hired-day)
       vals))

(report employees)
;; => ([{:first-name "A",
;;       :last-name "B",
;;       :email "A.B@nubank.com.br",
;;       :hired-at #inst "2022-05-20T00:00:00.000-00:00"}]
;;     [{:first-name "C",
;;       :last-name "D",
;;       :email "C.D@nubank.com.br",
;;       :hired-at #inst "2022-05-21T00:00:00.000-00:00"}
;;      {:first-name "E",
;;       :last-name "F",
;;       :email "E.F@nubank.com.br",
;;       :hired-at #inst "2022-05-21T00:00:00.000-00:00"}])
```

## Explore Different Threading Operators

In each of the sections below, you will see an example of applying one of the threading macros Clojure provides. Note: You've already seen `->` and `->>`.

### Thread First `->`

```clojure
;; nested
(update (assoc {} :foo "bar") :foo keyword) ;; => {:foo :bar}

;; thread first
(-> {}
    (assoc :foo "bar")
    (update :foo keyword)) ;; => {:foo :bar}
```

### Thread Last `->>`

```clojure
;; nested
(apply + (filter even? (map inc (range 5)))) ;; => 6

;; thread last
(->> (range 5)
     (map inc)
     (filter even?)
     (apply +)) ;; => 6
```

### Some Thread First `some->`

Prevent operating on `nil` values unexpectedly.

```clojure
(-> {:first-name "Rich" :last-name "Hickey"}
    :hired-at
    .getTime) ;; Execution error (NullPointerException)

(some-> {:first-name "Rich" :last-name "Hickey"}
        :hired-at
        .getTime) ;; => nil

(some-> {:first-name "Rich" :last-name "Hickey" :hired-at #inst "2020-07-23"}
        :hired-at
        .getTime) ;; => 1595462400000
```

### Conditional Thread First `cond->`

Given an expression and set of predicate/form pairs, thread the
expression into the first argument position when the test is truthy.

```clojure
(defn describe-number
  [n]
  (cond-> []
    (odd? n)  (conj "odd")
    (even? n) (conj "even")
    (zero? n) (conj "zero")
    (pos? n)  (conj "positive")))

(describe-number 3) ;; => ["odd" "positive"]
(describe-number 4) ;; => ["even" "positive"]
```

### Thread As `as->`

Create a binding var that will control the placement of the
expressions. In this example you will use `$` but any valid var is
acceptable.

```clojure
(as-> {:ints (range 5)} $
  (:ints $)
  (map inc $)  ;; last position
  (conj $ 10)  ;; first position
  (apply + $)) ;; => 25
```

Because _any_ valid Clojure expression can be used, you are free to
introduce logic into the expression but be careful as this _may_ reduce the
readability.

```clojure
(as-> 10 $
  (dec $)
  (if (even? $)
    (dec $)
    (inc $))
  (* 2 $)) ;; => 20
```

### Note

All threading macros except for `as->` come with a first (`->`) and last (`->>`) positional variant.

## Identify When To Use Threading Operators

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
