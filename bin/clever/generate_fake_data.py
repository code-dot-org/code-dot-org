from faker import Faker
import random
import csv

# Initialize Faker
fake = Faker()

# Function to generate a random grade
def random_grade(low_grade, high_grade):
    # Convert the low and high grade to integers
    # convert K to 0
    if low_grade == 'K':
        low_grade = 0
    low_grade = int(low_grade)
    high_grade = int(high_grade)

    grades = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
    return grades[random.randint(low_grade, high_grade)]

# Function to generate a random gender
def random_gender():
    return random.choice(['Male', 'Female', 'Non-Binary', 'Prefer not to say'])

# Function to generate a random boolean value (Yes/No)
def random_boolean():
    return random.choice(['Yes', 'No'])

# Function to generate a random race
def random_race():
    races = ['White', 'Black or African American', 'Asian', 'American Indian or Alaska Native', 'Native Hawaiian or Other Pacific Islander']
    return random.choice(races)

# ... (other functions)

# Generate a fake elementary, middle, and high school
# Required: school_id, name, and school_number
def generate_schools():
    # Create three schools
    schools = [
        {
            "school_id": "1",
            "name": "Pineapple Elementary School",
            "school_number": "1",
            "state_id": "1",
            "type": "Elementary",
            "low_grade": "K",
            "high_grade": "5",
        },
        {
            "school_id": "2",
            "school_number": "2",
            "state_id": "2",
            "name": "Rockaway Beach Middle School",
            "type": "Middle",
            "low_grade": "6",
            "high_grade": "8",
        },
        {
            "school_id": "3",
            "school_number": "3",
            "state_id": "3",
            "name": "City High School",
            "type": "High",
            "low_grade": "9",
            "high_grade": "12",
        }
    ]

    # Put the schools in the same town.
    school_city = fake.city()
    school_state = fake.state_abbr()
    school_zip = fake.zipcode()

    for school in schools:
        school["school_address"] = fake.street_address()
        school["school_city"] = school_city
        school["school_state"] = school_state
        school["school_zip"] = school_zip
        school["school_phone"] = fake.phone_number()
        school["principal"] = fake.name()
        school["principal_email"] = fake.email()
    
    return schools

# Generate fake teachers
def generate_teachers(schools):
    teachers = []
    for school in schools:
        for _ in range(10):
            first_name = fake.first_name()
            last_name = fake.last_name()

            teachers.append({
                'school_id': school["school_id"],
                'teacher_id': fake.unique.random_number(digits=8),
                'first_name': first_name,
                'last_name': last_name,
                'username': f"{first_name.lower()}.{last_name.lower()}",
                'password': fake.password(),
                # Optional fields
                'teacher_number': fake.unique.random_number(digits=8),
                'state_teacher_id': fake.unique.random_number(digits=8),
                'middle_name': random.choice([fake.first_name(), ""]),
                'title': "",
                'teacher_email': f"{first_name.lower()}.{last_name.lower()}@example.com",
            })
    
    return teachers

# Generate fake students
# Required: school_id, student_id, first_name, last_name, and for our case: username, password
def generate_students(schools):
    students = []
    for school in schools:
        for _ in range(100):
            first_name = fake.first_name()
            last_name = fake.last_name()

            students.append({
                'school_id': school["school_id"],
                'student_id': fake.unique.random_number(digits=8),
                'first_name': first_name,
                'last_name': last_name,
                'username': f"{first_name.lower()}.{last_name.lower()}",
                'password': fake.password(),
                'middle_name': random.choice([fake.first_name(), ""]),
                'student_number': fake.unique.random_number(digits=8),
                'state_id': fake.unique.random_number(digits=8),
                'grade': random_grade(school["low_grade"], school["high_grade"])
                'gender': random_gender(),
                'dob': fake.date_of_birth(minimum_age=5, maximum_age=18).strftime('%Y-%m-%d'),
                'race': random_race(),
                'hispanic_latino': random_boolean(),
                'ell_status': random_boolean(),
                'frl_status': random_boolean(),
                'iep_status': random_boolean(),
                'street_address': fake.street_address(),
                'city': fake.city(),
                'state': school["school_state"],
                'zip_code': fake.zipcode(),
                'student_email': f"{first_name.lower()}.{last_name.lower()}@example.com",
                'contact_relationship': random.choice(['Parent', 'Guardian', 'Sibling', 'Other']),
                'contact_type': random.choice(['Phone', 'Email', 'Mail']),
                'contact_name': fake.name(),
                'contact_phone': fake.phone_number(),
                'contact_email': fake.email(),
            })

    return students

def convert_to_csv(array_of_objects, filename):
    """
    Converts an array of objects (dictionaries) to a CSV file.
    
    Parameters:
    - array_of_objects: List[Dict]. An array of dictionaries where each dictionary represents a row.
    - filename: str. The name of the file to which the CSV data will be written.
    """
    # Ensure the array is not empty to avoid KeyError when accessing keys
    if not array_of_objects:
        print("The array of objects is empty. Exiting function.")
        return

    # Open a file to write to, 'w' means write mode
    with open(filename, 'w', newline='') as csvfile:
        # Create a DictWriter object, specifying the fieldnames from the first object
        fieldnames = array_of_objects[0].keys()
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        # Write the header row
        writer.writeheader()

        # Write data rows
        for obj in array_of_objects:
            writer.writerow(obj)

schools = generate_schools()
teachers = generate_teachers(schools)
students = generate_students(schools)
# sections = generate_sections(teachers, schools)
# enrollments = generate_enrollments(students, sections)

convert_to_csv(schools, 'schools.csv')
convert_to_csv(teachers, 'teachers.csv')
convert_to_csv(students, 'students.csv')
