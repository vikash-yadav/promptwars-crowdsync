# CrowdSync: Multi-Agent Stadium Optimizer

A multi-agent AI system that predicts, manages, and optimizes crowd flow inside large stadiums in real time.

## 📱 Download the Attendee App

The CrowdSync Attendee App acts as your personal stadium concierge, providing real-time wayfinding, smart concession ordering, and localized notifications. 

**Ready to upgrade your event experience?**
* [📥 Download for iOS on the App Store](#)
* [📥 Download for Android on Google Play](#)

*(Note: The app requires you to scan your ticket barcode to unlock event-specific routing and ordering features.)*

## 🧠 AI Intelligence (Vertex AI Gemini)

The `ai_coordinator` uses Google Cloud Vertex AI (Gemini 1.5 Flash) to provide real-time assistance.

### How it works
- **Contextual Awareness**: Gemini is primed with "Stadium Coordinator" instructions.
- **Latency Optimized**: Uses Gemini 1.5 Flash for sub-second responses.
- **Resiliency**: Built-in fallback system ensures the app remains functional if the API is unreachable.

### How to Run Locally
1. **Authenticate**: `gcloud auth application-default login`
2. **Launch**:
   ```bash
   cd ai_coordinator
   pip install -r requirements.txt
   python main.py
   ```
