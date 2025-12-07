# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-12-XX

### Added

- Initial release of `@color4bg/next`
- `Color4Bg` Next.js component with support for all 14 background styles
- Support for `style`, `colors`, `seed`, `loop`, and `options` props
- Automatic DOM management and cleanup
- Dynamic prop updates support
- SSR compatibility for Next.js App Router
- Client component support with `'use client'` directive

### Features

- Next.js App Router compatible component wrapper for color4bg library
- Automatic canvas mounting to parent container
- Support for all background types: abstract-shape, aesthetic-fluid, ambient-light, big-blob, blur-dot, blur-gradient, chaos-waves, curve-gradient, grid-array, random-cubes, step-gradient, swirling-curves, triangles-mosaic, wavy-waves
- Props-based configuration
- Automatic resource cleanup on unmount
- SSR-safe initialization (only runs on client side)

