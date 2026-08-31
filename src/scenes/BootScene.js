import Phaser from 'phaser';
import { generateTextures } from '../utils/placeholderTextures.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    generateTextures(this);
    this.scene.start('Start');
  }
}