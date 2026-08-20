# Security Specification for DroidOS

## Data Invariants
1. A viewer can only update their own profile (points, watch time, facts).
2. Only the owner/admin can modify bot identity and configurations.
3. Roles and triggers are managed by the owner/admin.
4. Chat messages are immutable after creation.
5. Viewer points must be non-negative.

## The "Dirty Dozen" Payloads
1. Attempt to update another viewer's points.
2. Attempt to modify `role` field in viewer profile by the viewer themselves.
3. Attempt to modify bot `adminPin` without being an admin.
4. Attempt to create a trigger with a 1MB response string.
5. Attempt to delete the `config/botIdentity` document.
6. Attempt to update a chat message content after it has been sent.
7. Attempt to set `points` to a negative value.
8. Attempt to bypass `isOwner` check by spoofing `viewerId`.
9. Attempt to update `createdAt` or `firstSeen` timestamps.
10. Attempt to inject a script into a trigger response.
11. Attempt to bulk-read all viewer profiles without being an admin.
12. Attempt to create a document with an ID longer than 128 characters.

## Test Runner Plan
I will use `firestore.rules.test.ts` to verify these constraints.
