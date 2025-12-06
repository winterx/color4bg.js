# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] - 2024-12-06

### Fixed

- Fixed dependency issue: Changed `workspace:*` to `^0.1.1` for proper npm package resolution

## [0.1.1] - 2024-12-06

### Added

- Initial release of `@color4bg/react`
- `Color4Bg` React component with support for all 14 background styles
- Support for `style`, `colors`, `seed`, `loop`, and `options` props
- Automatic DOM management and cleanup
- Dynamic prop updates support
- TypeScript-friendly component interface

### Features

- React component wrapper for color4bg library
- Automatic canvas mounting to parent container
- Support for all background types: abstract-shape, aesthetic-fluid, ambient-light, big-blob, blur-dot, blur-gradient, chaos-waves, curve-gradient, grid-array, random-cubes, step-gradient, swirling-curves, triangles-mosaic, wavy-waves
- Props-based configuration
- Automatic resource cleanup on unmount

