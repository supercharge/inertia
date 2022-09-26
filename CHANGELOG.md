# Changelog

## [1.2.1](https://github.com/supercharge/inertia/compare/v1.2.0...v1.2.1) - 2022-09-25

### Updated
- bump dependencies


## [1.2.0](https://github.com/supercharge/inertia/compare/v1.1.0...v1.2.0) - 2022-09-19

### Added
- register partial views, request and response decorations in the service provider’s `boot` method (instead of `register`) which makes sure the container bindings are available

### Updated
- bump dependencies


## [1.1.0](https://github.com/supercharge/inertia/compare/v1.0.0...v1.1.0) - 2022-08-25

### Added
- add `share` method to middleware: allowing users to share props in a single place
- add `response.inertia().location(<url>)` method: redirect requests to the given internal or external `url`

### Updated
- update visibility to `protected` for internal `response.inertia().filterPartialData()` method


## 1.0.0 - 2022-08-22

### Added
- `request.inertia().share(data)` method: share data along the request lifecycle and add the shared data to the Inertia response
- `request.inertia().sharedData()` method: retrieve the shared data
- add `SharesData` class
- make `InertiaRequest` and `InertiaResponse` instances extend the `SharesData` class allowing you to share data from `request.inertia()` and `response.inertia()`

### Updated
- bump dependencies


## 0.4.0 - 2022-08-19

### Added
- `request.inertia()` method: returns a request-related Inertia instance resolving Inertia data from the request
- support Inertia partial reloads
- support Inertia lazy data evaluation

### Updated
- bump dependencies
- add dedicated `InertiaRequest` and `InertiaResponse` classes
- the generic `Inertia` class exposes utility functions only

### Breaking Changes
- removed `request.inertiaVersion()` method in favor of `request.inertia().version()`

## 0.3.1 - 2022-08-17

### Updated
- bump dependencies


## 0.3.0 - 2022-08-16

### Added
- bump dependencies
- add SSR support


## 0.2.0 - 2022-08-11

### Updated
- bump dependencies
- update to latest `Application` contract


## 0.1.0 - 2022-07-29

### Added
- `0.1.0` release 🚀 🎉
