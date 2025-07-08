import { initTabs } from './modules/tabs.js';
import { setupImageAnalysis } from './modules/analysis.js';
import { setupEncryption } from './modules/encryption.js';
import { setupDecryption } from './modules/decryption.js';

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    setupImageAnalysis();
    setupEncryption();
    setupDecryption();
});