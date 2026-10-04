# Interactive About Experience

## Goal
Keep the existing About page as the normal biography and add a second, game-style biography inspired by the scrolling interaction of the reference site, using Melchizedeck Kakese’s established gold, cream, and dark visual identity with an original character and scenery.

## What will change
- Add a distinct footer invitation for **About Me: Game Mode**, alongside the existing normal About link.
- Create a dedicated `/about-game` page with an original side-scrolling journey rather than copying the reference site’s artwork or exact layout.
- Build a custom character representing a writer and youth advocate, with keyboard, touch, and scroll controls.
- Turn the biography into a sequence of visual chapters: introduction, writing and publishing, youth advocacy, leadership/community work, achievements, and a final call to explore the main site.
- Add a clear switch between **Classic About** and **Game Mode** on both About experiences.
- Make all game-mode wording, chapter labels, descriptions, and scene image editable from the admin dashboard.
- Preserve the current About page and all existing site sections unchanged.

## Experience details
- The journey will move horizontally on larger screens while scroll or swipe advances the character through the story.
- On phones, the same experience will use large touch controls and a compact scene composition without overflowing text.
- Progress markers, a restart control, pause/mute-style accessibility controls where relevant, and reduced-motion support will be included.
- The page will use an original illustrated world and character shaped around books, scripts, ideas, community, and Tanzania-inspired environmental details.
- Text will remain short and readable so the visual journey stays primary.

## Technical details
- Add a new TanStack route and a focused interactive scene component.
- Use semantic site color tokens so light/dark theme changes remain consistent.
- Preload the character and scene artwork to prevent flashes or broken placeholders.
- Store editable content in the existing `page_sections` system and expose it under a new About Game editor group.
- Add complete page metadata for the new route.
- Verify desktop and mobile layouts, keyboard/touch interaction, reduced motion, current build health, and the footer link.
