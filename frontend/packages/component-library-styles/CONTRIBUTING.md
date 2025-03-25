# Contributing to Component Library Styles

Thank you for considering contributing to the Component Library Styles! 🎉  
We welcome all contributions — whether it’s a bug fix, new token, documentation improvement, or something else
entirely.  
This guide will help you get started quickly and ensure a smooth contribution process. To get the full picture of the
project, please refer to the [README.md](./README.md) file.

## Table of Contents

- [🛣️ Contribution Roadmap](#-contribution-roadmap)
- [🎨 How to Add a New Style or Token](#-how-to-add-a-new-style-or-token)
- [🚦 Production-ready Checklist](#production-ready-checklist)
- [🎯 Coding Standards](#-coding-standards)
- [🧪 How to Test Your Styles](#-how-to-test-your-styles)
- [🔀 Commit Message Guidelines](#-commit-message-guidelines)
- [📚 Need Help?](#-need-help)
- [💡 Tips for a Smooth PR Review](#-tips-for-a-smooth-pr-review)
- [✅ How to Get Your PR Approved Faster](#-how-to-get-your-pr-approved-faster)

## 🛣️ Contribution Roadmap

Here’s a quick guide to the contribution process:

1. **(The most important step!) Create a thread** in the `#ask-design-system` Slack channel about your change.
   If you don't have access to our slack, feel free to reach out through github issues, pull requests or any other
   means of communication.

   - **Get approval** from @markabarrett and/or @moshebaricdo (design team).
   - For technical details, ask @levadadenys and/or @kelbyhawn (engineering team).

2. **Create a separate PR** with `@code-dot-org/component-library-styles` code changes.

   - Make sure the PR follows the [Best Practices](./README.md/#best-practices).
   - Include relevant updates to tokens, colors, typography, and styles.

3. **Get it approved** by:

   - ✅ @moshebaricdo and/or @markabarrett (design)
   - ✅ @levadadenys and/or @kelbyhawn (technical implementation)

4. **Merge the PR** once approved.

5. **Use it in your project → Celebrate → Collect tons of appreciation!** 🎉

## 🎨 How to Add a New Style or Token

Most of the styles come directly from the design system Figma file. Here's a list of what can be added
and how to do it:

0. Check existing design tokens for duplicates or overlap to prevent redundancy.

1. **Add the token** to the appropriate SCSS file:

   - Fonts → `font.scss`
   - Variables → `variables.scss`
   - Mixins → `mixins.scss`

2. Ensure the token follows existing naming conventions (e.g., `field-helper-section-white`).

3. If adding a new style:

   - Follow the existing structure and organization.

4. **Test the token or style** across light/dark themes, RTL and, (if applicable)
   responsiveness (desktop, tablet, mobile).

5. Submit a PR following the [Contribution Roadmap](#-contribution-roadmap).

## 🚦Production-ready Checklist:

- Approved by the design team;
- Defined in the appropriate SCSS file;
- Tested in light and dark themes;
- Verified in Storybook (if applicable).

## 🎯 Coding Standards

- ✅ Use **SCSS** for consistency.
- ✅ Use **semantic colors** from `@code-dot-org/component-library-styles/colors.scss` where possible.
- ✅ Keep typography and spacing consistent with design tokens.
- ✅ Keep token names **descriptive** and follow existing naming conventions.
- ✅ Keep file size reasonable — split large files if needed.
- ⛔️ Avoid defining hard-coded colors — rely on CSS variables.

## 🧪 How to Test Your Styles

There's currently no automated testing for styles. Here's how you can test your changes manually or through other
packages automated tests:

1. **Unit Tests (Manually)** — Test RTL (right-to-left) support directly since it's part of Design System scope.
2. **Storybook Tests** — Ensure Storybook displays the token or style correctly.
3. **Accessibility Tests** — Run Axe tests to verify accessibility in light and dark themes.
4. **Visual Regression Tests** — Ensure the style appears correctly across browsers and devices.

➡️ See the full [Testing Guide](./README.md#testing) in the README.

## 🔀 Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format for all commit messages to ensure a consistent and readable git history.

```bash
<type>(<scope>): <description>
```

### ✅ Types:

| Type       | Description                                            |
| ---------- | ------------------------------------------------------ |
| `feat`     | A new feature                                          |
| `fix`      | A bug fix                                              |
| `docs`     | Documentation updates                                  |
| `refactor` | Code changes that neither fix a bug nor add a feature  |
| `test`     | Adding missing tests or updating existing tests        |
| `chore`    | Maintenance tasks (build process, tools, dependencies) |
| `perf`     | Performance improvements                               |

### ✅ Examples:

```bash
feat(colors): add new semantic token for primary background

fix(mixins): correct font size in button-text-large

docs(typography): update documentation for heading mixins
```

### ✅ Best Practices:

- Use present tense singular form (“add” not “added”, not “adds”).
- Keep the description concise and specific.

## 📚 Need Help?

If you need help at any point, reach out to:

- `#ask-design-system` Slack channel
- @moshebaricdo, @markabarrett for design questions
- @levadadenys, @kelbyhawnfor technical implementation questions

## 💡 Tips for a Smooth PR Review

✅ Keep the PR focused on **one token/group of tokens or style**.  
✅ Add **clear, descriptive commit messages**.  
✅ Add screenshots or recordings to demonstrate UI changes.  
✅ Keep PRs under **500 lines** where possible (if larger, split into smaller PRs).

✅ For larger PRs, consider creating a Draft PR for early feedback.

## ✅ How to Get Your PR Approved Faster

- If there’s no response after **24 hours**, politely ping the reviewer in Slack.
- If you receive feedback, **respond within 24 hours** to keep the momentum going.
- Make sure all **CI tests** are passing before requesting a review.

## 🙌 Thank you for helping improve the Code.org Design System (@code-dot-org/component-library-styles)!
