export interface Lang {
  code: string;
  name: string;
  native: string;
  greeting: string;
  agree: string;
  price: string;
  close: string;
}

export const LANGUAGES: Lang[] = [
  {
    code: "en",
    name: "English",
    native: "English",
    greeting:
      "Hi, this is Maya from SHARAN calling about the program you enquired about.",
    agree:
      "Great — I can send you a secure payment link on WhatsApp. Would that work?",
    price:
      "The 21-day diabetes reversal program is ₹9,999 all inclusive. Shall I send the payment link?",
    close:
      "Thank you for your time. I'll share the details on WhatsApp in a moment.",
  },
  {
    code: "hi",
    name: "Hindi",
    native: "हिन्दी",
    greeting:
      "नमस्ते, मैं SHARAN से माया बोल रही हूँ, आपने जिस प्रोग्राम के बारे में पूछा था उसी के बारे में बात करनी थी।",
    agree: "बहुत अच्छा — मैं WhatsApp पर पेमेंट लिंक भेज देती हूँ।",
    price: "21 दिन का डायबिटीज़ रिवर्सल प्रोग्राम ₹9,999 का है।",
    close: "धन्यवाद, मैं WhatsApp पर पूरी जानकारी भेज रही हूँ।",
  },
  {
    code: "ta",
    name: "Tamil",
    native: "தமிழ்",
    greeting:
      "வணக்கம், நான் SHARAN-இல் இருந்து Maya. நீங்கள் கேட்ட திட்டத்தைப் பற்றி பேச அழைக்கிறேன்.",
    agree: "நன்றி — WhatsApp-இல் பணம் செலுத்தும் இணைப்பை அனுப்புகிறேன்.",
    price: "21 நாள் நீரிழிவு மீட்பு திட்டம் ₹9,999.",
    close: "நன்றி, விபரங்களை WhatsApp-இல் அனுப்புகிறேன்.",
  },
  {
    code: "te",
    name: "Telugu",
    native: "తెలుగు",
    greeting:
      "నమస్తే, నేను SHARAN నుండి Maya మాట్లాడుతున్నాను. మీరు అడిగిన ప్రోగ్రామ్ గురించి మాట్లాడాలని.",
    agree: "బాగుంది — WhatsAppలో చెల్లింపు లింక్ పంపుతాను.",
    price: "21-రోజుల మధుమేహ తిరోగమన కార్యక్రమం ₹9,999.",
    close: "ధన్యవాదాలు, వివరాలను WhatsAppలో పంపుతాను.",
  },
  {
    code: "kn",
    name: "Kannada",
    native: "ಕನ್ನಡ",
    greeting:
      "ನಮಸ್ಕಾರ, ನಾನು SHARAN ನಿಂದ Maya. ನೀವು ಕೇಳಿದ ಕಾರ್ಯಕ್ರಮದ ಬಗ್ಗೆ ಮಾತನಾಡಲು ಕರೆ ಮಾಡಿದ್ದೇನೆ.",
    agree: "ಧನ್ಯವಾದಗಳು — ನಾನು WhatsApp ನಲ್ಲಿ ಪಾವತಿ ಲಿಂಕ್ ಕಳುಹಿಸುತ್ತೇನೆ.",
    price: "21 ದಿನಗಳ ಮಧುಮೇಹ ಹಿಮ್ಮುಖ ಕಾರ್ಯಕ್ರಮ ₹9,999.",
    close: "ಧನ್ಯವಾದಗಳು, ವಿವರಗಳನ್ನು WhatsApp ನಲ್ಲಿ ಕಳುಹಿಸುತ್ತೇನೆ.",
  },
  {
    code: "ml",
    name: "Malayalam",
    native: "മലയാളം",
    greeting:
      "നമസ്കാരം, ഞാൻ SHARAN-ൽ നിന്ന് Maya. നിങ്ങൾ ചോദിച്ച പ്രോഗ്രാമിനെ കുറിച്ച് സംസാരിക്കാൻ വിളിച്ചതാണ്.",
    agree: "നന്നായി — WhatsApp-ൽ പേയ്‌മെന്റ് ലിങ്ക് അയയ്ക്കാം.",
    price: "21-ദിവസത്തെ പ്രമേഹ വിപരീത പരിപാടി ₹9,999.",
    close: "നന്ദി, വിശദാംശങ്ങൾ WhatsApp-ൽ അയയ്ക്കുന്നു.",
  },
  {
    code: "mr",
    name: "Marathi",
    native: "मराठी",
    greeting:
      "नमस्कार, मी SHARAN कडून Maya बोलते आहे. तुम्ही विचारलेल्या प्रोग्रामबद्दल बोलायचं आहे.",
    agree: "छान — मी WhatsAppवर पेमेंट लिंक पाठवते.",
    price: "21-दिवसाचा मधुमेह उलट कार्यक्रम ₹9,999.",
    close: "धन्यवाद, तपशील WhatsAppवर पाठवते.",
  },
  {
    code: "bn",
    name: "Bengali",
    native: "বাংলা",
    greeting:
      "নমস্কার, আমি SHARAN থেকে Maya। আপনি যে প্রোগ্রাম সম্পর্কে জানতে চেয়েছিলেন সেই বিষয়ে কথা বলতে ফোন করেছি।",
    agree: "চমৎকার — আমি WhatsApp-এ পেমেন্ট লিংক পাঠিয়ে দিচ্ছি।",
    price: "21-দিনের ডায়াবেটিস প্রোগ্রাম ₹9,999।",
    close: "ধন্যবাদ, বিস্তারিত WhatsApp-এ পাঠাচ্ছি।",
  },
];

export function getLang(code: string): Lang {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}
