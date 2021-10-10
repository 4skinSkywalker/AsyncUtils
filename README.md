# AsyncUtils

Working on different apps I've found that subjects from RxJS proved to be a good way to deal with asynchronicity.
The best way to my eyes to make sense of subjects is to think about them as variables that consumers subscribe to in order to receive values.

## What I wanted to achieve

I wanted to provide an essential implementation of the following subjects from RxJS:
1. Subject, doens't have an initial value and doesn't cache any value
3. BehaviorSubject, requires an initial value and emits its current value to new consumers
4. ReplaySubject, emits a specified quantity of last emitted values in first-in-first-out fashion to new consumers

I've never required to complete or error out a subject, therefore I won't implement completion and erroring.

The API is compatible with that of RxJS subjects, I could drop-in replace them and use them with the "| async" in Angular.

## A much better naming

I always thought subjects in RxJS are poorly named.
Therefore I decided, for my light JS implementation, to rename them:
1. Subject becomes ObsEmitter, because the concept is similar to an EventEmitter
2. BehaviorSubject becomes ObsCacher, because it acts as a cache that consumers can read the latest value when they need it
3. ReplaySubject becomes ObsReplayer, this is pretty similar

I decided to throw away the Subject word and replace it with Obs: Obs stands for Observable and the noun right after should convey the fact it's also an Observer.

## Differences between RxJS and this

### ObsCacher (BehaviorSubject)

You can initialize it empty and the default value will be `undefined`, in RxJS you have to give it a value.

### ObsReplayer (ReplaySubject)

The difference is that it provides `.getValues()` that returns an array of values, while RxJS does not.

## Install

`npm i bada55asyncutils`

## Getting started

```js
let { ObsEmitter, ObsCacher, ObsReplayer } = require("bada55asyncutils");
```

### ObsEmitter example

The concept is similar to an EventEmitter that keeps a registry of multiple listeners.
When an event happens, e.g. new value arrives, it notifies those listeners.

```js
let contractInteraction$ = new ObsEmitter();

let subscription = contractInteraction$
    .subscribe(val =>
        console.log(val)
    );

contractInteraction$.next({ myData: "Interacted!" }); // console.log { myData: "Interacted!" }

subscription.unsubscribe();

contractInteraction$.next({ myData: "New interaction!" }); // Nothing happens
```

### ObsCacher example

It acts as a cache that subscribers can read the latest value when they need it.

```js
let selectedAccount$ = new ObsCacher("my-account");

let subscription = selectedAccount$
    .subscribe(val =>
        console.log(val) // console.log "my-account"
    );

console.log(selectedAccount$.getValue()); // console.log "my-account"

selectedAccount$.next("my-new-account"); // console.log "my-new-account"

subscription.unsubscribe();

selectedAccount$.next("my-yet-another-account"); // Nothing happens
```

### ObsReplayer example

ObsReplayer is similar to the ObsCacher in the way that it can send cached values to new subscribers, but instead of just one current value, it can record and send all values in cronological order.
When creating a ObsReplayer you can specify how many values you want to store in the buffer (bufferSize) and the amount of time to hold a value in the buffer before removing it from it (expireTime).

### Basic ObsReplayer example

```js
let boxesSent$ = new ObsReplayer();

boxesSent$.next("a");
boxesSent$.next("b");
boxesSent$.next("c");

let subscription = boxesSent$
    .subscribe(val =>
        console.log(val) // console.log [a, b, c]
    );

boxesSent$.next("d"); // console.log [a, b, c, d]

console.log(boxesSent$.getValues()); // console.log [a, b, c, d]

subscription.unsubscribe();

boxesSent$.next("e"); // Nothing happens
```

### Advanced ObsReplayer example #1

Imagine you would like to buffer a maximum of 3 values you could do so with a new ObsReplayer(3).

```js
let boxesSent$ = new ObsReplayer(3);

boxesSent$.next("a");
boxesSent$.next("b");
boxesSent$.next("c");

let subscription = boxesSent$
    .subscribe(val =>
        console.log(val) // console.log [a, b, c]
    );

boxesSent$.next("d"); // console.log [b, c, d]
boxesSent$.next("e"); // console.log [c, d, e]
```

### Advanced ObsReplayer example #2

Imagine you would like to have values as long as they are less than 2 seconds old, you could do so with a new ObsReplayer(null, 2000).

```js
let boxesSent$ = new ObsReplayer(null, 2000);

boxesSent$.next("a");
// Imagine you wait 2 seconds
boxesSent$.next("b");
boxesSent$.next("c");

let subscription = boxesSent$
    .subscribe(val =>
        console.log(val) // console.log [b, c]
    );
```

### Advanced ObsReplayer example #3

You can combine bufferSize and expireTime to get a maximum of 3 values, as long as the values are less than 2 seconds old, you could do so with a new ObsReplayer(3, 2000).
