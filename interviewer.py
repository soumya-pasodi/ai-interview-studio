import os
from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENAI_API_KEY", "")
)

class Interviewer:

    def __init__(self):
        self.asked_questions = []

    def generate_question(self, domain, level):

        prompt = f"""
You are a technical interviewer.

Domain: {domain}
Difficulty: {level}

Ask ONE interview question.
Do not repeat previous questions.

Previous questions:
{self.asked_questions}

Return only the question.
"""

        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=120,
            temperature=0.9
        )

        question = response.choices[0].message.content.strip()

        self.asked_questions.append(question)

        return question