class NotificationSound {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      // Initialize Web Audio API for custom notification sounds
      if (typeof window !== "undefined" && window.AudioContext) {
        this.audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
      }
    } catch (error) {
      console.warn("Web Audio API not supported:", error);
    }
  }

  // Play a simple notification beep
  playNotificationSound() {
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Create a pleasant notification sound (two quick beeps)
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(
        600,
        this.audioContext.currentTime + 0.1
      );

      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.2
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn("Could not play notification sound:", error);
    }
  }

  // Play browser notification sound (fallback)
  playBrowserNotification() {
    if (!this.enabled) return;

    try {
      // Simple audio element approach as fallback
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGNzfDOfScCIXDE7+DVHAZM"
      );
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore errors - notification sound is not critical
      });
    } catch (error) {
      console.warn("Could not play browser notification sound:", error);
    }
  }

  // Enable/disable notification sounds
  setEnabled(enabled) {
    this.enabled = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("notificationSoundEnabled", enabled.toString());
    }
  }

  // Get current sound preference
  isEnabled() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("notificationSoundEnabled");
      return stored === null ? true : stored === "true";
    }
    return this.enabled;
  }

  // Initialize sound preference from localStorage
  initFromStorage() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("notificationSoundEnabled");
      this.enabled = stored === null ? true : stored === "true";
    }
  }
}

// Create a singleton instance
const notificationSound = new NotificationSound();

// Initialize from storage when the module loads
if (typeof window !== "undefined") {
  notificationSound.initFromStorage();
}

export default notificationSound;
