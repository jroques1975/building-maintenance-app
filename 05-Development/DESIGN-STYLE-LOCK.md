# Design Style Lock (Do Not Drift)

Status: **LOCKED**
Date: 2026-02-21

## Canonical References
1. `http://100.78.107.25:8088/prototype-clean.html`
2. `http://100.78.107.25:8088/manager-dashboard/manager-dashboard.html`

## Locked Visual Rules
- Background: soft blue vertical gradient (`#f0f8ff` → `#e6f2ff`)
- Surface: white cards with rounded corners (16px) and subtle shadow
- Primary color: iOS blue `#007AFF`
- Border: neutral gray `#dee2e6` / input border `#ced4da`
- Typography: system stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)
- Buttons: blue primary, rounded 8px, white text
- Inputs: 2px border, rounded 10px, blue focus state
- Layout: centered container, clean spacing, no dark theme variants

## Implementation Guardrails
- No ad-hoc visual changes outside these rules.
- Any style change must be approved and reflected in this file first.
- New screens must reuse locked tokens/components before adding variants.

## Scope
Applies to:
- Login
- Dashboard
- Issues
- Work Orders
- Operator Continuity
- UAT pages (until replaced with final production pages)
