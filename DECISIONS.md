# Decision Points

## DP1 — The Nudge

**Decision:** Encourage + warn, never shame or block.

Crossing a target should provide clear feedback while preserving user autonomy. The goal is behavior awareness rather than punishment. By showing a non-intrusive warning when the weekly target is exceeded, the user is kept informed and encouraged to reflect on which categories contributed most, without being locked out or shamed.

## DP2 — Absurd Input

**Decision:** Warn + require explicit confirmation for unusually large values.

This approach catches accidental data-entry mistakes (like extra zeros) while still allowing legitimate, unusual activity to be recorded. By putting the user in control to either "Edit" or "Confirm anyway", we ensure high data quality without artificially restricting edge cases that may be valid for a specific user.

## DP3 — The Week

**Decision:** Monday through Sunday.

This provides a conventional weekly boundary and makes progress easy to understand across the typical working and weekend schedule. Mid-week progress displays the current accumulated footprint against the weekly target, ensuring users aren't incorrectly comparing a partial week's footprint against full historical weeks.
