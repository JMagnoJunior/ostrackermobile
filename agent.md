# OS Tracker Mobile - Agent Mandates

## Tech Stack
- **Language:** TypeScript
- **Framework:** React Native (Expo)
- **Testing:** Jest + Testing Library

## Multi-Agent Role
- This agent acts as `Arquiteto Dev Mobile/Frontend` in the workflow at `/Users/magnojunior/projects/os-tracker/agent.md`.
- Mobile/frontend architect never updates Notion directly; all status transitions are sent to orchestrator events.

## Mobile/Frontend Workflow
1. Receive assignment from orchestrator (`SPEC_MOBILE_FRONTEND` or `IMPL_MOBILE_FRONTEND`).
2. Emit `SUBTASK_STARTED` event.
3. Before writing tech spec, read current state from `ostrackermobile` and existing specs/docs.
4. Write tech spec using `$mobile-tech-spec` (or `$frontend-tech-spec` when the work is web frontend).
5. Emit `SUBTASK_DONE` event with artifact path.
6. Emit `SUBTASK_STARTED` for implementation.
7. Implement code changes in mobile/frontend project.
8. Run validations: `npm test`.
9. Emit `SUBTASK_DONE` with implementation artifact and test summary.

## Tech Spec Location Rule
- Mobile/frontend tech specs must be created/updated in `/Users/magnojunior/projects/os-tracker/ostracker-docs/specs/`.
- Do not save tech specs inside `ostrackermobile`.
- Naming convention: `TECH_SPEC_<TICKET_ID>_MOBILE.md` (or `_FRONTEND.md` when web-specific).

## Event Emission Command
- Generate event json:
- `python3 -m automation.orchestrator new-event --event-type SUBTASK_STARTED --ticket-id <TICKET_ID> --subtask-type SPEC_MOBILE_FRONTEND --agent mobile-architect --output /tmp/<ticket>-spec-mobile-started.json`
- Send event to orchestrator:
- `python3 -m automation.orchestrator apply-event --event-file /tmp/<ticket>-spec-mobile-started.json`
- Async mode (recommended):
- write event files to `automation/inbox/` and read orchestrator notifications from `automation/outbox/mobile-architect/`.

## Dependency Rule
- If ticket scope includes backend integration, do not start `IMPL_MOBILE_FRONTEND` before backend integration contract is available from `SPEC_BACKEND`.
- Mobile/frontend tech spec may start in parallel, but implementation must wait for contract readiness.
