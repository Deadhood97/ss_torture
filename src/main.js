import './style.css'
import Phaser from 'phaser'
import { SoundManager } from './SoundManager.js'

class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene')
    this.currentTool = 'sword'; // Default tool
    this.damageGroup = null;
  }

  preload() {
    this.load.image('base_model', 'assets/visuals/base_model.png');

    // Tools
    this.load.image('icon_shoe', 'assets/visuals/tool_shoe.webp');
    this.load.image('icon_gun', 'assets/visuals/tool_gun.png');
    this.load.image('icon_sword', 'assets/visuals/tool_sword.png');

    // Damage & FX
    this.load.image('damage_shoeprint', 'assets/visuals/damage_shoeprint.png'); // Shoe
    this.load.image('damage_bullet_hole', 'assets/visuals/bullet_hole.png'); // Gun
    this.load.image('damage_cut', 'assets/visuals/damage_cut.png'); // Sword
    this.load.image('fx_muzzle', 'assets/visuals/fx_muzzle.png');
  }

  create() {
    this.soundManager = new SoundManager(this);
    this.soundManager.playAmbient();

    // Center coordinates
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;

    // Base Character
    this.base = this.add.image(cx, cy, 'base_model').setInteractive();
    // Scale down if too big (assuming 1024x1024, lets scale to fit 600h)
    const scale = 500 / this.base.height;
    this.base.setScale(scale);

    // Damage Group (to render above base but below UI)
    this.damageGroup = this.add.group();

    // UI Container
    this.createUI();

    // Input Handling (PointerDown works for Mouse + Touch)
    this.base.on('pointerdown', (pointer) => {
      this.handleHit(pointer);
    });
  }

  createUI() {
    const tools = [
      { id: 'sword', icon: 'icon_sword' },
      { id: 'gun', icon: 'icon_gun' },
      { id: 'shoe', icon: 'icon_shoe' }
    ];

    const h = this.cameras.main.height;
    const w = this.cameras.main.width;

    // 1. Toolbelt Background (The "Tray")
    const barHeight = 110;
    const barY = h - barHeight;

    // Draw a gradient-like bar using Graphics
    const bar = this.add.graphics();
    bar.fillStyle(0x111111, 0.95);
    bar.fillRect(0, barY, w, barHeight);
    bar.lineStyle(2, 0x444444, 1);
    bar.beginPath();
    bar.moveTo(0, barY);
    bar.lineTo(w, barY);
    bar.strokePath();
    bar.setScrollFactor(0);


    // 2. Buttons
    const buttonSpacing = 130;
    const startX = (w / 2) - ((tools.length - 1) * buttonSpacing) / 2;
    const btnY = barY + (barHeight / 2);

    this.toolButtons = [];

    tools.forEach((t, index) => {
      const container = this.add.container(startX + (index * buttonSpacing), btnY);

      // Selection Indicator (Glow/Border) - Hidden by default
      const indicator = this.add.graphics();
      indicator.lineStyle(3, 0xffffff, 0.8);
      indicator.strokeRect(-45, -45, 90, 90);
      indicator.fillStyle(0xffffff, 0.1);
      indicator.fillRect(-45, -45, 90, 90);
      indicator.alpha = 0; // Hide initially

      // Background for hit area
      const hitArea = this.add.rectangle(0, 0, 90, 90, 0x000000, 0).setInteractive({ useHandCursor: true });

      // Icon
      const icon = this.add.image(0, 0, t.icon);
      const scale = Math.min(80 / icon.width, 80 / icon.height);
      icon.setScale(scale);

      container.add([indicator, hitArea, icon]);
      container.setScrollFactor(0);

      // Data
      container.setData('id', t.id);
      container.setData('icon', icon);
      container.setData('indicator', indicator);

      // Events
      hitArea.on('pointerdown', () => this.selectTool(t.id));

      hitArea.on('pointerover', () => {
        if (this.currentTool !== t.id) {
          this.tweens.add({
            targets: icon,
            scale: scale * 1.1,
            duration: 100
          });
          icon.setTint(0xdddddd);
        }
      });

      hitArea.on('pointerout', () => {
        if (this.currentTool !== t.id) {
          this.tweens.add({
            targets: icon,
            scale: scale, // Reset to original
            duration: 100
          });
          icon.clearTint();
        }
      });

      this.toolButtons.push(container);
    });

    this.selectTool('sword');
  }

  selectTool(id) {
    this.currentTool = id;
    this.toolButtons.forEach(container => {
      const indicator = container.getData('indicator');
      const icon = container.getData('icon');
      const myId = container.getData('id');

      if (myId === id) {
        // Active State
        indicator.alpha = 1;
        icon.clearTint();
        icon.alpha = 1;
        // Ensure scale is normal or slightly elevated
        const baseScale = Math.min(80 / icon.width, 80 / icon.height);
        icon.setScale(baseScale);
      } else {
        // Inactive State
        indicator.alpha = 0;
        icon.setTint(0x888888);
        icon.alpha = 0.7;
        // Reset scale
        const baseScale = Math.min(80 / icon.width, 80 / icon.height);
        icon.setScale(baseScale);
      }
    });
  }

  handleHit(pointer) {
    const x = pointer.x;
    const y = pointer.y;
    let damageTexture = '';
    let blendMode = Phaser.BlendModes.NORMAL;
    let rotation = Math.random() * 360;

    let scale = 0.2 + Math.random() * 0.1; // Default scale

    switch (this.currentTool) {
      case 'shoe':
        this.soundManager.playHammerImpact(); // Heavy thud works for shoe
        damageTexture = 'damage_shoeprint';
        blendMode = Phaser.BlendModes.MULTIPLY;
        this.cameras.main.shake(100, 0.01);
        break;
      case 'gun':
        this.soundManager.playGunshot();
        damageTexture = 'damage_bullet_hole';
        // Muzzle Flash
        const flash = this.add.image(x, y, 'fx_muzzle').setScale(0.5);
        this.time.delayedCall(50, () => flash.destroy());
        this.cameras.main.shake(50, 0.02);
        scale = 0.15 + Math.random() * 0.05; // Slightly smaller for bullets
        break;
      case 'sword':
        this.soundManager.playSlice();
        damageTexture = 'damage_cut';
        scale = 0.1 + Math.random() * 0.05; // Smaller cuts as requested
        break;
    }

    if (damageTexture) {
      const dmg = this.add.image(x, y, damageTexture);
      dmg.setScale(scale); // Varied size
      dmg.setRotation(Phaser.Math.DegToRad(rotation));
      dmg.setBlendMode(blendMode);
      this.damageGroup.add(dmg);
    }
  }

  update() {
    // Game loop
  }
}

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth, // Full screen for mobile
  height: window.innerHeight,
  parent: 'game-container',
  backgroundColor: '#222222',
  scene: [MainScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const game = new Phaser.Game(config);
