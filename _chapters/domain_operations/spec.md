---
title: Entity Validation w/ `clojure.spec`
sequence: 6
---

The `clojure.spec` library was released in 2016, and provides tools to ensure that entities have an expected shape. While it's still an alpha release, its API remains relatively stable.

Using `spec`, we can ask a number of questions about our data. We'll focus on Money and Currency, providing a brief overview of how to validate using `clojure.spec`.

First we have to include it in our namespace via `require`:

```clj
intro.finance=> (require '[clojure.spec.alpha :as s])
```

We're including this package as `s`, as that's what the guide recommends. You may provide a more descriptive name if you like.

We want to ensure that the Money entities that get passed to our domain operations are valid. So, what does it mean to be a Money?

- A Money entity is an associative structure with an `:amount` and a `:currency`
  - the `:amount` is an integer
  - the `:currency` is a Currency entity
- A Currency entity is an associative structure containing a :divisor, a :code, and optionally a :sign and a `:desc`
  - the `:divisor` is an integer
  - the `:code` is a string, and must match a list of acceptable codes
  - the optional `:sign` and `:desc` are a strings

Let's translate this into `clojure.spec` terms.

First, we have to add some specifications (specs) to Clojure's _registry_. This allows us to re-use our specs. Since the registry can span many libraries, it's useful to use fully-qualified keywords when identifying the spec we're defining. We define a reusable spec using `s/def`. Those specs can be either a _predicate_ function or a set of acceptable values.

> **Predicate Functions<br/>** A predicate function takes a single argument and returns a truthy value.

Some of these are straightforward--note the fully-qualified (fancy) keys:

```clj
(s/def :money/amount int?)
(s/def :currency/divisor int?)
(s/def :currency/sign string?)
(s/def :currency/desc string?)
```

We also need to specify that a Currency's `:code` should be a string _and_ a member of a set of acceptable codes. We do this with `and`.

```clj
(s/def :currency/code (and string? #{"USD" "BRL" "UKG" ,,, }))
```

The optional fields for Currency are `:sign` and `:desc`. We can indicate this with `s/nilable`. This indicates that the field's value is not required, but if it's present, it should be a `string`.

```clj
(s/def :currency/sign (s/nilable string?))
(s/def :currency/desc (s/nilable string?))
```

Now we have enough to create a Currency spec, composing the other specs:

```clj
(s/def :finance/currency (s/keys :req-un [:currency/divisor
                                          :currency/code]
                                 :opt-un [:currency/sign
                                          :currency/desc]))
```

In registering our `:finance/currency` spec, we're telling the registry that a Currency should require the keys `:divisor` and `:code`, and may optionally have the keys `:sign` and `:desc`. As is often the case, we haven't been using fully qualified keys for our Currency entities so far, so we require them with `:req-un` and `:opt-un`. This tells `clojure.spec` that an unqualified key is also fine. If we _had_ been using fully qualified keys diligently, we'd have registered with `:req` and `:opt`.

We can check on any currency (or all currencies) by using the `s/valid?` function with the fully-qualified key of the Currency entry:

```clj
intro-clojure.finance=> (s/valid? :finance/currency (:usd currencies))
true
intro-clojure.finance=> (map #(s/valid? :finance/currency %) (vals currencies))
(true true true)
```

Now that we can validate a currency, we can create a validation for Money:

```clj
(s/def :finance/money (s/keys :req-un [:money/amount
                                       :finance/currency]))
```

Now for any Money entity, we can check its validity with `s/valid?`:

```clj
intro-clojure.finance=> (s/valid? :finance/money (make-money 1234 (:brl currencies)))
true
```

What's more, we can use `s/explain` to figure out what's wrong. This function will note all the problems with value being tested:

```clj
intro-clojure.finance=> (s/explain :finance/money {:amount "a", :currency (:brl currencies)})
"a" - failed: int? in: [:amount] at: [:amount] spec: :money/amount
```

The value "a" isn't an integer, and that isn't a valid money entity.

There is a temptation to put this kind of validation into the domain operations themselves, but resist this temptation. The best places for validations are at the boundaries of the system, and between systems that are passing data to one another.

Entity validation, or contract validation, are relatively expensive operations within our data processing. Thus, we recommend its usage only where they're strictly necessary.

When dealing with data inside our domain, we can always validate it through unit or integration tests. At our system boundaries we can use the contract validation to avoid undesired changes to our data consumers.
