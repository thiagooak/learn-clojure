---
title: On Laziness
sequence: 3
---

We briefly touched on laziness before, and it's worth getting into some detail. In general, when we're processing sequences we're creating a pipeline: take a sequence, then produce another sequence that can answer our questions or resolve the program's requirements.

The sequence that is _produced_ by the pipeline must then be _consumed_ by our program. This notion of _producer_ and _consumer_ is key to understanding _lazy sequences_.

Most Clojure sequence functions produce lazy sequences, and therefore our sequence processing pipelines produce lazy sequences. These processes don’t perform the transformation when the function is evaluated. Instead, the lazy sequence is evaluated only as needed by consumers of the sequence. That is, the sequences are evaluated _on demand_.

Lazy sequences are useful in that they can avoid doing work that never needs to be computed. If we only ever `take 5` elements of a sequence, there's no reason to evaluate the rest of the sequence, only the first five elements. Lazy sequences are also useful for representing infinite sequences of values.

Consider the Fibonacci sequence:

```clj
user=> (defn fib-next
  "generates the next pair of the Fibonacci sequence"
  [[a b]]
  [b (+ a b)])
#'user/fib-next
user=> (def fibonacci-sequence
  (map first (iterate fib-next [0 1])))
#'user/fibonacci-sequence
user=> (take 10 fibonacci-sequence)
(0 1 1 2 3 5 8 13 21 34)
user=> (take 5 fibonacci-sequence)
(0 1 1 2 3)
```

We will never (and could never) look at number in the sequence all for a computation, but defining them as an infinite sequence allows us to take as many as we need for our purposes.

Sometimes, however, we need to be able to reason about _when_ a computation will take place. The `into` function eagerly computes the output for an entire sequence. It also happens that `into` is often more efficient both in terms of memory usage and time.

Instead of taking a single function, `into` takes a _transducer_. The topic of transducers is beyond the scope of this module, but most seq functions,  given no arguments, create a transducer. To add more steps, we can use `comp`.

```clj
user=> (doc comp)
-------------------------
clojure.core/comp
([] [f] [f g] [f g & fs])
  Takes a set of functions and returns a fn that is the composition
  of those fns.  The returned fn takes a variable number of args,
  applies the rightmost of fns to the args, the next
  fn (right-to-left) to the result, etc.
```

For example, to eagerly compute the squares of all odd numbers between 1 and 20, we could use `comp` to _compose_ a function from `filter` and `map`, then use the composition with `into`:

```clj
user=> (def odd-squares (comp (map #(* % %)) (filter odd?)))
#'user/odd-squares
user=> (into [] odd-squares (range 21))
[1 9 25 49 81 121 169 225 289 361]
```

Most of the time we don't need to know exactly when a sequence is processed. The ins and outs of laziness can be learned organically, but it's worth a mention here.

So far in this module we've covered filtering, mapping, and reducing in simple terms. Let's add them all together into a more realistic problem to tie the room together.

### Combinations

How we think about processing sequences:

1. Figure out what question you’re trying to ask. This step is often the most difficult.
2. Filter the data to remove unneeded elements.
3. Transform the elements into the desired form.
4. Reduce the transformed elements to the answer.

Consider the transaction entity from earlier, with a few more fields:

```clj
{
  :account-id       "12345-01"
  :amount           { :amount 12000
                      :currency {:divisor 100, :code "USD", :sign "$", :desc "US Dollars"}}
  :details          {,,,}
  :source           :transfer
  :status           :committed
  :timestamp        1654530232597
  :transaction-type :debit
}
{
  :account-id       "12346-02"
  :amount           { :amount 10000
                      :currency {:divisor 100, :code "USD", :sign "$", :desc "US Dollars"}}
  :details          {,,,}
  :source           :deposit
  :status           :pending
  :timestamp        1654534231831
  :transaction-type :debit
}
```

Note that we've added a `:status` field for this module. The valid options for `:transaction-type` are `:debit` and `:credit`, and options for `:status` are `:pending` and `:committed`. The `:details` field contains other information about the transaction, and is optional.

Any given account will have an associated sequence of transactions. For the sake of completeness, we can assume that before the transaction made it into the list, it was validated as correct.

We'll also need our `+$` function from the Domain Operations module:

```clj
(defn +$
  "creates a Money object equal to the sum of the Money arguments"
  ([m1] m1)
  ([m1 m2]
    (ensure-same-currency! m1 m2)
    (make-money (+ (:amount m1) (:amount m2)) (:currency m1)))
  ([m1 m2 & monies]
    (apply ensure-same-currency! m1 m2 monies)
    (let [amounts (map :amount (conj monies m1 m2))
          new-amount (reduce + amounts)]
      (make-money new-amount (:currency m1)))))
```

 Let's consider a few questions:

 1. What is the total of all money deposited into an account?
 2. What is the account's available balance?
 3. What is the total value of all outgoing money that has not yet settled?

An assumption we'll make to simplify things: all money in the account is represented in the same currency. We'll create functions to answer each of these questions. First, let's assume that there is a sequence of all transactions in the system, called `all-transactions`, and that all currency in this system is terms of the `default-currency`. We'll also use the `make-money` function from the Domain Operations module.

```clj
(def all-transactions [,,,]) ; every transaction ever!

(def currencies {
  :usd { :divisor 100 :code "USD" :sign "$"
         :desc "US Dollars" }
  :brl { :divisor 100 :code "BRL" :sign "R$"
         :desc "Brazilian Real" }})

(def default-currency (:brl currencies))

(defn make-money
  "takes an amount and a currency, creating a Money entity"
  ([]                {:amount 0
                      :currency default-currency})
  ([amount]          {:amount amount
                      :currency default-currency})
  ([amount currency] {:amount amount
                      :currency currency}))
```

Now, we can build pipelines to answer our questions. Most of the functions we define below are for clarity, and are not strictly necessary.

```clj
(defn transactions-for-account-id
  "given an account-id and a seq of transactions,
   return all transactions belonging to that account id"
  [account-id txs]
  (filter #(= account-id (:account-id %)) txs))

(defn filter-by-status
  "given a status and a list of transactions,
   return all transactions matching that status"
  [status txs]
  (filter #(= status (:status %)) txs))

(defn filter-by-type
  "given a tx-type and a list of transactions, return all transactions
   whose :transaction-type matches the tx-type."
   [tx-type txs]
   (filter #(= tx-type (:transaction-type %)) txs))

; 1. what is the total of all deposits made into an account?
(defn total-settled-debits
  "given an account-id, returns a Money entity whose :amount
   is the sum of all Money deposited into the account. includes
   :pending transactions"
  [account-id]
  (->> all-transactions
    (transactions-for-account-id account-id)
    (filter-by-type :debit)
    (map :amount) ; extract the :amount field
    (reduce +$))) ; add amounts together

; 2. what is the available balance? the trick here is that for a negative
;    balance, the available balance is zero.
(defn available-balance
  "get all available (settled) balance"
  [account-id]
  (let [txs (transactions-for-account-id account-id all-transactions)
        settled-txs (filter-by-status :settled txs)
        debits (filter-by-type :debit settled-txs)
        credits (filter-by-type :credit settled-txs)
        debit-amts (map :amount debits)
        credit-amts (map :amount credits)
        neg-amts (map #(assoc % :amount (- (:amount %))) credit-amts)
        amounts (concat debit-amts neg-amts)
        total-monies (reduce +$ amounts)]

    (cond
      (<= 0 (:amount total-monies)) total-monies
      :else (make-money 0 default-currency))))


; 3. what is the total of all pending outgoing transactions?
(defn pending-credits
  "given a sequence of transactions, returns a money entity
   representing all unsettled (pending) credit transactions"
  [txs]

  (->> txs
       (filter-by-type :credit)
       (filter-by-status :pending)
       (map :amount)
       (reduce +$)))
```

As you can see, most pipelines are straightforward to compose. The helper functions we wrote above all take the collection as the last argument, so they can be used with the _thread-last_, making for a simple syntax.

Because the `:amounts` in the Transaction entity data model are always positive, it became necessary to split credits and debits in the `available-balance` function---each step of that process is captured in the `let` for ease of debugging and to pass on to the next step.

Questions we should ask at this point:

- Is this the most efficient way to process this information?
- Would a change in the data model make processing the data easier? What consequences would that have elsewhere?
- Do the helpers improve or hurt understanding of the functions?

Consider those questions for a few minutes, then we can wrap this module up.