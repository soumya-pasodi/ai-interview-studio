import google.generativeai as genai

genai.configure(api_key="YOUR_REAL_KEY")

model = genai.GenerativeModel("gemini-1.5-flash")

response = model.generate_content("Explain Artificial Intelligence in simple words")

print(response.text)