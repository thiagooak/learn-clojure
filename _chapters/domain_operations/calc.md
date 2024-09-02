---
title: Calculated Values
sequence: 3
---

Let us suppose that we're intending to display a Money entity. We might have a function that displays the value as a formatted string:

```clj
(defn show-galleons
  "creates a display string for Harry Potter money"
  [amount]
    (let [{:keys [divisor code sign desc]} (:ukg currencies)
        galleons      (int (/ amount divisor))
        less-galleons (rem amount divisor)
        sickles       (int (/ less-galleons 17))
        knuts         (rem less-galleons 29)]
    (str galleons " Galleons, " sickles " Sickles, and " knuts " Knuts")))

(defn show-money
  "creates a display string for a Money entity"
  [{:keys [amount currency]}]
  (let [{:keys [divisor code sign desc]} (currency currencies)]
    (cond
        (= code "UKG")
          (show-galleons amount)
        :else
          (let [major (int (/ amount divisor))
                minor (mod amount divisor)]
            (str sign major "." minor)))))
```

Let's add a `:displayed` element to the constructor above.

```clj
(defn make-money
  "takes an amount and a currency, creating a Money entity"
  [amount currency]
    (let [money {:amount amount
                 :currency currency}]
      (-> money
        (assoc :displayed (show-money money)))))
```

Now if we find ourselves with some wizarding currency in the UK, we'd have a decent way to show it.

```clj
user=> (make-money 525 (:ukg currencies))
{:amount 1225,
 :currency
 {:divisor 493,
  :code "UKG",
  :sign "ʛ",
  :desc "Galleons of the United Kingdom"},
 :displayed "2 Galleons, 14 Sickles, and 7 Knuts"}
 ```

We only provided this functionality for our most specific constructor. If we did this for all variations of our Money constructor it would be really repetitive. It's more likely that we would only make that calculation as we needed it. In general, we want to keep our entities (and their associated operations) as lightweight as possible.

So far, we've approached our constructors as pure functions that generate only our entities. In the next section, we'll look at a scenario where that's not enough.

