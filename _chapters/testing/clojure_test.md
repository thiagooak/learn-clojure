---
title: clojure.test
sequence: 1
---

[clojure.test](https://clojuredocs.org/clojure.test) is the unit testing framework that ships with Clojure.

The core of `clojure.test` is the `is` macro.
`is` lets you make assertions of any expression.

```clojureevaloff
(require '[clojure.test :refer :all])

(is (= 4 (+ 2 2)))
; true

(is (= 5 (+ 2 2)))
; FAIL in () (NO_SOURCE_FILE:1)
; expected: (= 5 (+ 2 2))
;   actual: (not (= 5 4))
; false

(is (instance? Long 256))
; true

(is (.startsWith "abcde" "ab"))
; true
```

explain the `deftest` macro

```clojureevaloff
(require '[clojure.test :refer :all])
; nil

(deftest my-test
    (is (thrown? ArithmeticException (/ 1 0))))

(comment
    (run-tests))
```

explain the `testing` macro