# Leaderboard Security Remediation

## Current risk

The iOS client writes scores directly to Firestore. Authentication identifies the player, but it does not prove that a submitted score came from a legitimate game run. Client-side limits and checks can be bypassed.

## Required backend boundary

1. Deny direct client writes to `mobileLeaderboardV1/**` in Firestore Security Rules.
2. Submit completed runs to a callable HTTPS backend authenticated with Firebase Authentication.
3. Enforce Firebase App Check on the submission endpoint.
4. Validate score bounds, elapsed run duration, event sequence, replay nonce, and one-time run identifier on the server.
5. Apply per-user and per-device rate limits.
6. Write leaderboard documents only from the trusted backend using the Admin SDK.
7. Keep leaderboard reads authenticated and return only the public fields `name`, `score`, and rank.
8. Log rejected submissions without storing ID tokens or other credentials.

## Migration sequence

- Deploy the verification endpoint and restrictive Firestore Rules together.
- Update the client to request a one-time run token before gameplay and submit the resulting run to the endpoint.
- Verify offline/error behavior before removing the existing REST write path.
- Rotate or invalidate outstanding run tokens during deployment.

The current online behavior is intentionally retained until this backend is available. Adding more JavaScript validation would not close the security boundary.
