# Getting Started

## Introduction

The following section discusses the prerequisites and set-up of the repository, as well as available functionality.

### Built With:
The following make up the repository.

- PNPM - Package Manager
- ReactJS Typescript - Frontend
- Supabase - Backend As A Service
- PostgreSQL - SQL Database

### Design Overview:

placeholder

### Supabase Schema:

placeholder

### Prerequisites:
In order to work with this repository, it is a necessity to have:

- Node.js and pnpm installed on your machine
- A code editor of your choice
- Familiarity with terminal or command prompt

### Setup:

1. Clone the repository to your local machine.

   ```sh
   git clone https://github.com/your-username/straightforward-med-ims.git
   ```

2. Navigate to the directory

   ```sh
   cd straightforward-med-ims
   ```

3. Install PNPM Packages

   ```sh
   pnpm install
   ```

4. Create a Supabase account and set up a new project.

5. Obtain your Supabase API URL and Service Key and update the .env file in the project root with the following information:

   ```sh
   REACT_APP_SUPABASE_URL=your_supabase_api_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_service_key
   ```

6. Run the application.

   ```sh
   pnpm run dev
   ```

### Usage:

The Epworth Hospital's PTA Digitisation Project includes the following:

1. A dashboard overview. Here, clinicians can access important information, including but not limited to:
      - The number of patients, clinicians and tests being conducted each month in the hospital
      - The number of patients undergoing PTA treatment that are still experiencing symptoms, in comparison to the number of patients who are PTA free
      - A calendar

2. A management page, wherein both clinicians and patients can be added to the system. Patients can also be searched, and their latest test results can be retrieved. Where required, patients can also be removed from the system.

3. A test history page provides a thorough collation of all past tests a patient has conducted and any necessary details concerning that test.

4. A Westmead PTA Scale (WPTAS) testing form, and an Agitated Behavioural Scale (ABS) form, which are used by clinicians to assess a patient for PTA. Upon completion of either test, a summary page is displayed with the patient's responses, as well as the accuracy of their answers.

### License:

This project is licensed under the `LICENSE`.

## Contact
Project by [Amogha Raviprasad, Anant Jap Singh, Joseph Ward, Yang Liu, Zihan Wang]