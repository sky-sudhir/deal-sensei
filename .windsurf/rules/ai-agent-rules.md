---
trigger: always_on
---

# AI Agent Rules

## ✅ Guidelines

update the .env files accordingly if not have right key update it with dummy key and ask me update with actual key

for frontend
THE AMOUNT WILL BE IN RUPEE

run only windows command

- **Use** `api.js` file for adding api and import from there

- **Use** `useQuery(GET)` and `useMutation(MUTATE)` hooks present in `src/hooks` for API calls

- **Use** redux user slice for user authentication and route protection make changes if required

for backend

use type module for import export-backend

use apiResponse.js for response
throw CustomError.js for error
pass the error to next middleware
take example of company feature and do the same

- **Each feature** lives in its own folder under `feature/`
- **Each module** contains:
  - `controller.js`: Business logic for API endpoints
  - `route.js`: Route definitions
  - `repository.js`: DB access layer
  - `schema.js`: Mongoose model/schema
  - `validator.js`: Joi/Yup validation logic
- **Shared logic** lives in `middleware/` and `utils/`
- **Config files** like DB setup go in `config/`

## 🧠 Core Principles

1. **No Solo Decisions**  
   Always consult before making critical decisions.

2. **Avoid Assumptions**  
   Clarify when uncertain—never guess context or intent.

3. **Justify Choices**  
   If multiple solutions exist, explain why one is chosen over others.

## ✅ Behavior Guidelines

- Confirm unclear inputs.
- Request missing information.
- Present pros/cons when offering options.

## 📌 Reminder

Your job is to **assist, not assume**.

## ⏸ Phase Control

- After completing each phase, pause and confirm with me.
- Do not proceed to the next phase without explicit approval.
