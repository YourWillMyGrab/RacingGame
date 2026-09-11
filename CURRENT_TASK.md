# Current Task

- Task id: DOC-REVIEW-2026-09-11
- Goal: Review Markdown against the current repository, correct stale checkpoints and document the development-skill evaluation.
- Baseline commit: 54a36cd (`docs: record GitHub Pages hosting`).
- Status: DONE
- Acceptance criteria: documentation matches the validated M5.1 state; stale remote/baseline claims are removed; next task is explicit; test/build/stress evidence is recorded; relevant skill decisions are documented.
- Validation: `npm test` (30/30), `npm run build`, `npm run test:stress -- 1000`, clean working tree before documentation edits; `origin/master` tracks `54a36cd`.
- Skills installed: official `playwright`; `NousResearch/hermes-agent` `hermes-agent`.
- Outcome: state files, README, changelog and development workflow were aligned. No gameplay code changed.
- Resume: Start M5.2 Time Attack from `54a36cd`. Preserve M5.1 fork and full-run regressions.
