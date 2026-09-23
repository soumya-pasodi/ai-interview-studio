from interviewer import Interviewer
from evaluator import Evaluator
from voice import speak


def start_interview(user, domain):

    interviewer = Interviewer()
    evaluator = Evaluator()

    total_score = 0
    questions_attempted = 0

    speak(f"Hello {user}. Welcome to the {domain} interview.")

    # ask number of questions
    while True:
        speak("How many questions would you like to answer?")
        try:
            num_questions = int(input("Enter number of questions: "))
            if num_questions > 0:
                break
            else:
                print("Enter a positive number.")
        except:
            print("Please enter a valid number.")

    speak(f"I will ask you {num_questions} questions.")
    speak("If you want to exit anytime type exit.")

    for i in range(num_questions):

        # difficulty progression
        if i < num_questions * 0.4:
            level = "easy"
        elif i < num_questions * 0.7:
            level = "medium"
        else:
            level = "hard"

        speak("Preparing your question")

        question = interviewer.generate_question(domain, level)

        speak(f"Question {i+1}. {question}")

        answer = input("\nYour Answer: ")

        if answer.lower() == "exit":
            speak("You exited the interview.")
            break

        speak("Analyzing your answer")

        result = evaluator.evaluate(question, answer)

        speak("Here is your feedback")
        speak(result)

        try:
            score = int(result.split("/")[0].split(":")[1])
            total_score += score
        except:
            pass

        questions_attempted += 1

        print("\n-----------------------------------\n")

    # final summary
    speak("Interview complete")

    if questions_attempted > 0:
        avg_score = total_score / questions_attempted
    else:
        avg_score = 0

    print("\n========== Interview Summary ==========")
    print("Questions Attempted:", questions_attempted)
    print("Average Score:", round(avg_score, 2))

    if avg_score >= 8:
        performance = "Excellent"
    elif avg_score >= 6:
        performance = "Good"
    elif avg_score >= 4:
        performance = "Average"
    else:
        performance = "Needs Improvement"

    print("Performance Level:", performance)

    speak(f"You attempted {questions_attempted} questions")
    speak(f"Your average score is {round(avg_score,2)}")
    speak(f"Your performance level is {performance}")
    speak("Thank you for attending the interview")