import os
from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENAI_API_KEY", "")
)

class Evaluator:

    def evaluate(self, question, answer):

        prompt = f"""
You are an expert technical interviewer.

Question:
{question}

Candidate Answer:
{answer}

Evaluate the answer and respond in this format:

Score: X/10
Strength: What was correct
Missing: What important point is missing
Suggestion: How to improve
"""

        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200
        )

        result = response.choices[0].message.content.strip()

        return result