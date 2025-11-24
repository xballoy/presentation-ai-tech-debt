# Lodash Analysis & Native JavaScript Migration Report

## Summary

Found **9 files** using lodash with **25 function calls** across the codebase. Most functions have straightforward native JavaScript replacements with identical behavior.

---

## High-Priority Replacements (High Usage)

### 1. `_.isEmpty()` - 3 occurrences
**Files:** config.js:46, routes.js:32, seller.js:72, public/javascripts/seller.js:72

**Current:**
```javascript
_.isEmpty(self.props)
_.isEmpty(sellerName) || _.isEmpty(sellerUrl) || _.isEmpty(sellerPwd)
```

**Native replacement:**
```javascript
Object.keys(self.props).length === 0
!sellerName || !sellerUrl || !sellerPwd
```

**Notes:**
- For objects: `Object.keys(obj).length === 0`
- For strings: Use truthiness check `!str` or `str === ''`
- For arrays: `arr.length === 0`
- **Edge case:** lodash `isEmpty` treats `null`, `undefined`, numbers, booleans as empty. Native checks need explicit handling if these types are expected.

**Migration effort:** Low (10 min)

---

### 2. `_.map()` - 4 occurrences
**Files:** repositories.js:13-14, routes.js:12, dispatcher.js:30, public/javascripts/seller.js:84

**Current:**
```javascript
var sellers = _.map(sellersMap, function (seller) {
  return seller
})
```

**Native replacement:**
```javascript
var sellers = Object.values(sellersMap)
```

**Current:**
```javascript
var sellerViews = _.map(sellerService.allSellers(), function (seller) {
  return {
    cash: seller.cash,
    name: seller.name,
    online: seller.online
  }
})
```

**Native replacement:**
```javascript
var sellerViews = sellerService.allSellers().map(function (seller) {
  return {
    cash: seller.cash,
    name: seller.name,
    online: seller.online
  }
})
```

**Current:**
```javascript
return _.map(_.range(17), function (i) {
  return i % 2 === 0
})
```

**Native replacement:**
```javascript
return Array.from({length: 17}, (_, i) => i % 2 === 0)
```

**Notes:**
- For arrays: Use native `.map()`
- For objects: Use `Object.values()` + `.map()` or `Object.entries().map()`
- **Behavior identical** for arrays

**Migration effort:** Low (5 min)

---

### 3. `_.reduce()` - 2 occurrences
**Files:** repositories.js:208, repositories.js:217

**Current:**
```javascript
var countryDistributionByWeight = _.reduce(europeanCountries, function (distrib, infos, country) {
  var i
  for (i = 0; i < infos[1]; i++) {
    distrib.push(country)
  }
  return distrib
}, [])
```

**Native replacement:**
```javascript
var countryDistributionByWeight = Object.entries(europeanCountries).reduce(function (distrib, [country, infos]) {
  var i
  for (i = 0; i < infos[1]; i++) {
    distrib.push(country)
  }
  return distrib
}, [])
```

**Notes:**
- For arrays: Use native `.reduce()`
- For objects: Use `Object.entries(obj).reduce()`
- **Behavior identical**

**Migration effort:** Low (5 min)

---

## Medium-Priority Replacements

### 4. `_.sortBy()` - 1 occurrence
**Files:** repositories.js:16

**Current:**
```javascript
return _.sortBy(sellers, function (seller) { return -seller.cash })
```

**Native replacement:**
```javascript
return sellers.sort(function (a, b) { return b.cash - a.cash })
```

**Notes:**
- **Edge case:** Native `.sort()` mutates the array. Use `.slice().sort()` if immutability needed.
- **Behavior identical** for numeric sorting

**Migration effort:** Low (2 min)

---

### 5. `_.forEach()` - 1 occurrence
**Files:** dispatcher.js:194

**Current:**
```javascript
_.forEach(self.sellerService.allSellers(), function (seller) {
  // ...
})
```

**Native replacement:**
```javascript
self.sellerService.allSellers().forEach(function (seller) {
  // ...
})
```

**Notes:**
- **Behavior identical**
- Native `.forEach()` available since ES5

**Migration effort:** Trivial (1 min)

---

### 6. `_.has()` - 1 occurrence
**Files:** order.js:53

**Current:**
```javascript
if (!_.has(bill, 'total')) {
  throw new Error('The field "total" in the response is missing.')
}
```

**Native replacement:**
```javascript
if (!Object.hasOwn(bill, 'total')) {
  throw new Error('The field "total" in the response is missing.')
}
```

**Alternative (broader support):**
```javascript
if (!Object.prototype.hasOwnProperty.call(bill, 'total')) {
  throw new Error('The field "total" in the response is missing.')
}
```

**Notes:**
- `Object.hasOwn()` is ES2022 (Node 16.9+)
- **Edge case:** lodash checks deep paths like `_.has(obj, 'a.b.c')`. Native doesn't support this. The usage here is simple, so native works.

**Migration effort:** Low (2 min)

---

### 7. `_.find()` + `_.result()` - 1 occurrence
**Files:** reduction.js:36

**Current:**
```javascript
var reduction = _.result(_.find(reductions, function (reduc) {
  return reduc.sum <= total
}), 'reduction')
```

**Native replacement:**
```javascript
var found = reductions.find(function (reduc) {
  return reduc.sum <= total
})
var reduction = found ? found.reduction : undefined
```

**Notes:**
- `_.result()` safely accesses properties and calls functions
- Native requires explicit undefined check
- **Behavior identical**

**Migration effort:** Low (3 min)

---

## Low-Priority Replacements (Not in Backend/Tests)

### 8. `_.takeRight()` - 2 occurrences
**Files:** public/javascripts/seller.js:84, 97 (frontend only)

**Current:**
```javascript
data: _.takeRight(data.history[seller], 10)
```

**Native replacement:**
```javascript
data: data.history[seller].slice(-10)
```

**Notes:**
- **Behavior identical**
- `.slice(-n)` takes last n elements

**Migration effort:** Trivial (1 min)

---

## Functions Without Easy Native Replacement

### 9. `_.fill()` - 1 occurrence
**Files:** repositories.js:68

**Current:**
```javascript
return _.fill(newSellersCashHistory, lastRecordedValue, lastRecordedIteration, currentIteration)
```

**Native replacement:**
```javascript
return newSellersCashHistory.fill(lastRecordedValue, lastRecordedIteration, currentIteration)
```

**Notes:**
- Native `.fill()` available since ES6
- **Behavior identical**

**Migration effort:** Trivial (1 min)

---

### 10. `_.shuffle()` - 1 occurrence
**Files:** repositories.js:215

**Current:**
```javascript
_.shuffle(countryDistributionByWeight)
```

**Native replacement:**
```javascript
// Fisher-Yates shuffle
for (let i = countryDistributionByWeight.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [countryDistributionByWeight[i], countryDistributionByWeight[j]] =
    [countryDistributionByWeight[j], countryDistributionByWeight[i]]
}
```

**Notes:**
- No native equivalent
- **Keep lodash for this** or implement Fisher-Yates
- Low frequency usage

**Migration effort:** Medium (15 min) - not recommended

---

### 11. `_.sample()` - 1 occurrence
**Files:** repositories.js:226

**Current:**
```javascript
return _.sample(countryDistributionByWeight)
```

**Native replacement:**
```javascript
return countryDistributionByWeight[Math.floor(Math.random() * countryDistributionByWeight.length)]
```

**Notes:**
- **Behavior identical**
- Simple random element selection

**Migration effort:** Trivial (1 min)

---

### 12. `_.random()` - 3 occurrences
**Files:** order.js:20, 26, 28

**Current:**
```javascript
var items = _.random(1, 10)
var price = _.random(1, 100, true)  // floating point
var quantities[item] = _.random(1, 10)
```

**Native replacement:**
```javascript
var items = Math.floor(Math.random() * 10) + 1
var price = Math.random() * 99 + 1  // [1, 100)
var quantities[item] = Math.floor(Math.random() * 10) + 1
```

**Notes:**
- lodash `_.random(min, max)` is inclusive on both ends
- Native `Math.random()` is [0, 1), needs transformation
- **Edge case:** lodash `_.random(min, max, true)` returns float. Native can do this but requires care.

**Migration effort:** Low (5 min)

---

### 13. Type checking: `_.isNumber()`, `_.isString()`, `_.isFunction()` - 3 occurrences
**Files:** repositories.js:163, 168, 171; dispatcher.js:139

**Current:**
```javascript
if (_.isNumber(def)) { ... }
if (_.isString(def)) { ... }
if (_.isFunction(taxRule)) { ... }
if (!_.isNumber(offlinePenalty)) { ... }
```

**Native replacement:**
```javascript
if (typeof def === 'number') { ... }
if (typeof def === 'string') { ... }
if (typeof taxRule === 'function') { ... }
if (typeof offlinePenalty !== 'number') { ... }
```

**Notes:**
- **Edge case:** `typeof NaN === 'number'` is true. lodash same behavior.
- **Behavior identical** for typical cases

**Migration effort:** Trivial (2 min)

---

### 14. `_.clone()` - 1 occurrence
**Files:** dispatcher.js:22

**Current:**
```javascript
var copy = _.clone(order)
```

**Native replacement:**
```javascript
var copy = { ...order }
```

**Notes:**
- **Shallow clone only**. lodash `_.clone()` is also shallow.
- For deep clone, would need `_.cloneDeep()` (not used in codebase)
- **Behavior identical**

**Migration effort:** Trivial (1 min)

---

### 15. `_.range()` - 1 occurrence
**Files:** dispatcher.js:30

**Current:**
```javascript
_.map(_.range(17), function (i) {
  return i % 2 === 0
})
```

**Native replacement:**
```javascript
Array.from({length: 17}, (_, i) => i % 2 === 0)
```

**Notes:**
- **Behavior identical**

**Migration effort:** Trivial (1 min)

---

### 16. `_.times()`, `_.groupBy()`, `_.size()` - Test file only
**Files:** specs/repositories_spec.js:146, 148, 150

**Current:**
```javascript
const samples = _.times(mostImportantPopulation * 10, countries.randomOne)
const occurrences = _.groupBy(samples)
expect(_.size(occurrences.FR)).toBeGreaterThan(151381)
```

**Native replacement:**
```javascript
const samples = Array.from({length: mostImportantPopulation * 10}, () => countries.randomOne())
const occurrences = samples.reduce((acc, val) => {
  acc[val] = (acc[val] || []).concat(val)
  return acc
}, {})
expect(occurrences.FR.length).toBeGreaterThan(151381)
```

**Notes:**
- `_.groupBy()` groups by identity when no iteratee provided
- Native requires manual reduce
- **Keep lodash for tests** (low priority)

**Migration effort:** Medium (10 min) - not recommended for tests

---

## Migration Strategy

### Phase 1: Quick Wins (30 minutes)
1. `_.map()` → `.map()` / `Object.values()`
2. `_.forEach()` → `.forEach()`
3. `_.isEmpty()` → length checks / truthiness
4. `_.fill()` → `.fill()`
5. `_.clone()` → spread operator
6. `_.range()` → `Array.from()`
7. `_.takeRight()` → `.slice(-n)`
8. `_.sample()` → manual random index

### Phase 2: Type Checks (5 minutes)
9. `_.isNumber()` / `_.isString()` / `_.isFunction()` → `typeof`

### Phase 3: Moderate Changes (15 minutes)
10. `_.sortBy()` → `.sort()`
11. `_.reduce()` → `Object.entries().reduce()`
12. `_.has()` → `Object.hasOwn()`
13. `_.find()` + `_.result()` → `.find()` + manual access
14. `_.random()` → `Math.random()` transformations

### Keep Lodash For:
- `_.shuffle()` (no native equivalent, low frequency)
- Test utilities (`_.times()`, `_.groupBy()`, `_.size()`) - low value

### Total Effort Estimate
- **Backend migration:** ~1 hour
- **Risk level:** Low (most replacements are 1:1)
- **Bundle size savings:** ~70KB minified (if lodash fully removed)

---

## Recommended Action

Replace all except `_.shuffle()`. Consider either:
1. Keep lodash just for `_.shuffle()` (minimal footprint if tree-shaken)
2. Replace `_.shuffle()` with Fisher-Yates implementation and remove lodash entirely

Test thoroughly after migration, especially:
- Empty/null/undefined edge cases in `isEmpty` replacements
- Sorting behavior (mutation concerns)
- Random number distributions
