# Xcode Security Settings Decisions

**Project:** App  
**Updated:** 2026-09-27

## Applied code hardening

- Native audio bridge accepts only main-frame messages from `capacitor://localhost`.
- Native audio actions and bundled audio filenames are allowlisted.
- Volume and fade inputs are checked for finite values and clamped.
- Concurrent sound-effect players are capped at 12.

## Runtime and performance

- Game simulation uses a fixed 60 Hz timestep with a maximum of four catch-up steps.
- Green candle tinting is cached at asset load instead of applying a canvas filter every frame.
- `RUGGED_MIN_ELAPSED` corrected from 15 ms to 15,000 ms.

## Build security decisions

- **Enhanced Security: deferred.** The current Personal Development Team and provisioning profile do not support the Enhanced Security capability. The attempted capability and entitlements were removed from the project files after validation failed.
- **Hardware Memory Tagging: deferred.** Requires staged soft-mode rollout and supported hardware.
- **Checked Pointer Arithmetic: deferred.** Requires Enhanced Security, memory tagging, compatible signing, and dedicated native dependency testing.
- Existing security compiler warnings remain at their current project defaults.

## External security boundary

Online scores are still written directly by the authenticated client to Firestore. Client checks cannot prevent forged scores. Required remediation remains: deny client writes, submit through an authenticated backend with Firebase App Check, validate one-time run tokens and event timing server-side, then rate-limit writes.
