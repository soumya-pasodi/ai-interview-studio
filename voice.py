import pyttsx3

engine = pyttsx3.init('sapi5')

engine.setProperty("rate", 150)
engine.setProperty("volume", 1)

voices = engine.getProperty("voices")
engine.setProperty("voice", voices[0].id)

def speak(text):
    print("\nAI Interviewer:", text)
    engine.say(text)
    engine.runAndWait()