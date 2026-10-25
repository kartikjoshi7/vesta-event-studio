# Contributing to Vesta Event Studio

Thank you for contributing to Vesta Event Studio!

## Engineering Guidelines & Standards

1. **File Size Strict Limit**:
   Every source file in `src/` and `api/` must strictly stay **<= 200 lines**. Large components must be decomposed into single-responsibility subcomponents.
2. **Zero `any` Types**:
   The codebase strictly enforces TypeScript types. Never use `any` or loose type casting.
3. **No Unsafe DOM Manipulation**:
   Never use `innerHTML` or `dangerouslySetInnerHTML`. All user inputs must pass through `sanitizeUserInput()`.
4. **Testing & Coverage**:
   Ensure all automated tests pass (`npm test`) with zero warnings and no regressions.
5. **Quality Gates**:
   Run `npm run check` before submitting pull requests:
   ```bash
   npm run check
   ```
