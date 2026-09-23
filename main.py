from database import create_tables
from user_auth import register, login
from interview_system import start_interview

create_tables()

while True:

    print("\n===== AI Interview System =====")
    print("1 Register")
    print("2 Login")
    print("3 Exit")

    choice = input("Enter choice: ")

    if choice == "1":
        register()

    elif choice == "2":

        user = login()

        if user:

            print("\nChoose Interview Domain")
            print("1 Gen AI")
            print("2 Cyber Security")
            print("3 Java Full Stack Development")
            print("4 PFSD")
            print("5 Data Science & Analytics")
            print("6 Robotics")
            print("7 VLSI")
            print("8 Power Electronics")

            domain_choice = input("Enter domain number: ")

            domains = {
                "1":"gen_ai",
                "2":"cyber_security",
                "3":"java_full_stack",
                "4":"pfsd",
                "5":"data_science",
                "6":"robotics",
                "7":"vlsi",
                "8":"power_electronics"
            }

            domain = domains.get(domain_choice)

            start_interview(user, domain)

    elif choice == "3":
        break