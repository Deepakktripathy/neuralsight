# De-Cluttering & Cognitive Load Reduction Plan: Calm Visual Surfaces & Unified Learning Guide

> **Status: ✓ Implemented & Verified**
> - Redundant "Launch Studio" buttons removed from Stage 2 (single header action retained).
> - Scattered inline info icons removed from all visualizer canvases and Metrics HUD.
> - Knowledge and training expectations unified into the slide-out Glossary & Guide drawer.

A comprehensive UX decluttering plan to eliminate visual clutter, remove scattered inline info icons from the interactive canvas, unify all training expectations and glossary definitions into a single serene slide-out guide, and remove redundant "Launch Studio" buttons from Stage 2.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following confirmed decisions govern this implementation:

- **Confirmed Decision 1 (Stage 2 Action Button)**: Keep **only** the single authoritative "Launch Studio" button in the **top-right page header** of Stage 2 (`ModelConfigurationPage.tsx`). Remove the 3 redundant duplicate buttons (from section 1 header, live tuning handoff card, and bottom footer bar).
- **Confirmed Decision 2 (Calm Canvas Discipline)**: Remove scattered inline `TrainingInfoButton` icons from the visualizer headers and cards (`CNNUnifiedConvolution`, `CNNVisualizer`, `TransformerVisualizer`, `GANVisualizer`, `RNNVisualizer`, `RLVisualizer`, `StandardNNVisualizer`, and `MetricsHUD`).
- **Confirmed Decision 3 (Unified Learning Guide)**: Consolidate all architectural guidance, phase-by-phase training expectations ("What to expect"), and glossary definitions into the **single, polished slide-out Glossary & Guide drawer**, accessible cleanly via:
  1. The top header's book icon (`BookOpen`), and
  2. The dedicated `[📖 {Architecture} Guide & Glossary]` button in the left sidebar.

---

### 1. Overview & Core Concept

- **What It Does**: Restores a calm, production-grade visual hierarchy to the simulation studio. The canvas breathes freely without visual noise or icon pepper, while rich training explanations remain effortlessly accessible in an organized, searchable reference drawer whenever the student or researcher wants it.
- **Key Value**: Drastically reduces cognitive fatigue and sensory overload. Eliminates duplicate navigation controls on Stage 2 so users have a clear, unambiguous path forward.

---

### 2. User Experience & Visual Design

#### Stage 2: Clean Problem Setup Layout
```
┌────────────────────────────────────────────────────────────────────────┐
│ NeuralSight  ·  Models > Step 2: Problem Setup     [▶ Launch Studio]  │ (Single Header CTA)
├────────────────────────────────────────────────────────────────────────┤
│ Title: CNN Problem Setup                                               │
│ Objective & Task (Classification / Regression)                         │
│ Dataset Selection (MNIST, CIFAR-10, Medical X-Ray)                     │
│                                                                        │
│ Live Studio Tuning Capabilities (Information Card - No button spam)   │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────┐ │
│ │ Live Hyperparameters │ │ Dynamic Topology     │ │ Failure Sandbox  │ │
│ └──────────────────────┘ └──────────────────────┘ └──────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

#### Studio: Calm Visual Canvas
- **Visualizer Surfaces**: Pure visualizer diagrams (matrices, kernel sliders, attention heatmaps, minimax meters) rendered cleanly without repeated inline `(i)` icons cluttering titles.
- **Metrics HUD**: Sleek, compact floating metrics pill in the corner showing live values (`Loss`, `Accuracy`), expanding on click to the full interactive chart, free of icon noise.
- **Unified Knowledge Drawer**: Accessible on demand. Houses the active architecture's training expectations ("What to expect during training"), specific primitives, and general deep learning concepts with fast search.

---

### 3. Concrete Execution Steps

1. **Clean up Stage 2 (`ModelConfigurationPage.tsx`)**:
   - Keep the primary `[▶ Launch Studio]` button in the top-right header (Line 110).
   - Remove duplicate button from the section title bar (Line 187).
   - Remove duplicate button from the Live Interactive Tuning card header (Line 414).
   - Convert the bottom bar from a redundant duplicate button strip into a clean summary banner or remove the redundant button (Line 493).
2. **Remove Scattered Inline Info Icons from Visualizers**:
   - Remove `TrainingInfoButton` from `CNNUnifiedConvolution.tsx` Stage 1 header.
   - Remove `TrainingInfoButton` from `CNNVisualizer.tsx` Stage 2 header.
   - Remove `TrainingInfoButton` from `TransformerVisualizer.tsx` view control bar.
   - Remove `TrainingInfoButton` from `GANVisualizer.tsx` minimax bar.
   - Remove `TrainingInfoButton` from `RNNVisualizer.tsx` view control bar.
   - Remove `TrainingInfoButton` from `RLVisualizer.tsx` view control bar.
   - Remove `TrainingInfoButton` from `StandardNNVisualizer.tsx` decision space header.
   - Remove `TrainingInfoButton` from `MetricsHUD.tsx`.
3. **Verify Unified Guide Accessibility**:
   - Ensure the top bar Info/Guide button and Sidebar `[📖 {Architecture} Guide & Glossary]` cleanly open the adaptive drawer.
   - Run `lint_applet` and `compile_applet` to verify zero build errors.
