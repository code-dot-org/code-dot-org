# 04 — Student wants to share a project

**Verdict: HELPED**

## Path taken
- CodeAI Documentation (home) — 0 clicks (start)
- Students — 1 click
- Can I share this? (Students > Projects) — 2 clicks (answered "can I share it")
- Sharing and publishing (via Next steps link) — 3 clicks (answered "how do I get the link")

## Answering sentence
- "Anyone who has the link can see your project and try it out -- they do not need a CodeAI account." (sharing-and-publishing)
- "You are 13 or older and your teacher has not disabled sharing, or You are under 13 and your teacher has enabled sharing for your class." (can-i-share-this)
- How-to: "Open your project in the editor. Select Share in the project header. In the share dialog, select Copy link to project." (sharing-and-publishing)

## Confusion points
- "Can I share this?" page presents the rule as a conditional with branches. Persona (14 years old) had to do the math: match against "13 or older" branch vs "under 13" branch. Expected a plain sentence: "If you're 13 or older, you can share unless your teacher turned it off."
- "Can I share this?" never answers "can someone without an account see it" — that answer is only on the Sharing and publishing page. Had to click Next steps to find it. Expected the "can I share" page to answer the account question directly.
- No mention of a "Link copied!" confirmation after the copy step.

## Screenshots
- Share dialog screenshot on Sharing and publishing: HELPED. Showed the real "Copy link to project" and "Send to phone" buttons, matched the product. Minor issue: blank white box on the left (probably QR code or thumbnail) rendered empty — looked broken.
- No missing screenshots where one was needed.

## Product test
Succeeded. Created a new Game Lab project, clicked Share, got dialog matching the docs screenshot. Clicked "Copy link to project," opened the link, and it loaded with no sign-in prompt — consistent with the docs' claim that no account is needed.

## Three wishes
1. "Can I share this?" should say up front whether a friend without an account can see the link.
2. The age rule should be one plain sentence for the common case, not a two-branch list to match against.
3. The share-dialog screenshot should not have a blank broken box in it.
