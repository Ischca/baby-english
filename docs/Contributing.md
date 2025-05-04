# 🤝 Contributing Guide

## Branch Strategy
- `main`: deployable / protected
- `feat/*`, `fix/*`, `chore/*`

## Commit
- Conventional Commits. Example: `feat(chat): add scorer util`

## Pull Request Checklist
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
- [ ] Update docs if necessary

## Code Style
- ESLint Airbnb + Prettier
- TypeScript strict

## Testing
- Unit: Vitest (`*.test.ts[x]`)
- E2E: Playwright

## License Agreement
By submitting a PR, you agree to license your contribution under the MIT license.
