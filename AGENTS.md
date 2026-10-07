<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the standard biography at `/about` and the immersive interactive biography at `/about-game`; this preserves a readable profile while allowing an experimental experience.
- Derive homepage focus and event ordering with the shared journey sorter from published CMS events; do not persist a separate event copy that can become stale.
- Preload homepage journey collections in its route loader and share collection query keys with admin invalidation; road stories reuse the advocacy collection so existing editing controls remain authoritative.
