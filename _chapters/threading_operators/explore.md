---
title: Explore Different Threading Operators
sequence: 2
---

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