Project Document: Project "Vex" (Working Title)
1. Executive Summary

    Genre: Interactive Simulation / Clicker.

    Platform: Web (GitHub Pages).

    Core Loop: Select Tool → Interact with Model → Observe Visual/Audio Decay → Unlock/Escalate.

    Visual Style: High-contrast 2D, clinical, dark aesthetic with layered "damage" overlays.

2. Technical Stack

    Engine: Phaser 3 (Lightweight 2D Framework).

    Language: JavaScript (ES6+).

    Storage: GitHub Pages (Static hosting).

    Version Control: Git.

    Asset Compression: TinyPNG (for images), OGG/MP3 (for audio).

3. Visual & Asset Requirements
3.1 Character Model (The "Target")

The model is a static high-resolution portrait with a "layered" damage system.

    Base Layer: Default face (provided by user/dev).

    Interactive Hitboxes: Specific coordinates for Eyes, Mouth, Forehead, and Cheeks.

    Damage Decals (Alpha PNGs):

        Tier 1: Redness, swelling, light scratches.

        Tier 2: Deep bruising, cuts, bleeding.

        Tier 3: Structural damage (e.g., swollen shut eyes, bandaged areas).

3.2 Tool Assets

Each tool serves as the custom cursor.

    Blunt: Hammer / Mallet (causes screen shake + bruising).

    Sharp: Needle / Scalpel (causes localized bleeding).

    Special: Battery/Electrodes (causes model "jitter" and screen flash).

4. Audio Requirements (SFX)

Audio must be synced to the "hit" frame for maximum impact.
Event	Sound Type	Effect
Impact (Light)	Sharp click or snick	Used for needles/small tools.
Impact (Heavy)	Deep thud or crunch	Used for hammers; includes low-freq bass.
Model Reaction	Muffled grunts / Sharp exhales	Humanizes the simulation.
Ambient	Low industrial hum / Neon flickering	Provides a constant "unease."