---
title: Understand Function Call-Chaining
sequence: 1
---

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