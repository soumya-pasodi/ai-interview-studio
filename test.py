from google import genai

client = genai.Client(api_key="AIzaSyD31aiUouRDr6wWaD1Zkqm38Kps46EMSJc")

response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents="Explain Artificial Intelligence simply"
)

print(response.text)