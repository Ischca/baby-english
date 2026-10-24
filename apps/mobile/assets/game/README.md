# Garden artwork

`world-garden.png` is an original AI-generated background for Baby English, created with OpenAI image generation on 2026-10-24. No external reference images were used. The source image is 1536 × 1024; the app crops it responsively. Character portraits and interactive UI are separate native components.

## Generation brief

Create a landscape 3:2 background for a cozy native mobile learning RPG, a usable game environment rather than a UI mockup. A tiny welcoming storybook village garden: cream cottage with a terracotta tile roof, winding pale sandy path, rolling mint green grassy islets, round sculpted trees and bushes, pastel flowers, turquoise stream edges, soft distant hills and a pale aqua sky. High quality 3D toy diorama with tactile matte materials, friendly rounded silhouettes, crafted details, gentle ambient occlusion and warm morning light. Cream, teal, sage, muted peach and honey palette. Keep the cottage fully visible at center-right in the middle distance; leave open lawn in the lower center for a separate avatar and an uncluttered top quarter for game overlays. Gently elevated three-quarter view, full bleed with no cutaway base. No text, letters, numbers, logos, watermark, UI, buttons, icons, frames, people, faces, animals or phone mockup.

## Illustrated character

The current character is drawn in `apps/mobile/src/BabyMascot.tsx`, using the same React Native SVG / Animated components as the existing profile avatar. It is a native vector illustration with warm outlines, small dot eyes, soft colors and separate body, waving forearm, head and eyelid layers. The raised arm bends at a covered elbow, the hand has four fingers and an inward-facing thumb, and the seated body has a round belly, tucked knees, small soft booties and short, plump limbs. The body is narrower than the head and both palms are kept small to give the mascot infant proportions. The forearm pivots at the elbow and the head at the neck to keep their attachments stable during motion. It replaces the earlier rendered baby image.

Idle motion includes gentle breathing, head movement, occasional hand waving and blinks. Tapping the character produces a brief smile, wave and “Hello!” greeting. Motion stops when the home screen loses focus or the app goes into the background. The system's Reduce Motion preference disables movement while preserving the greeting response.

No Live2D or Rive runtime, image sequence, external script or network asset is required. The source is directly editable and renders at any resolution on web / native. The earlier PNG remains available in Git history.
