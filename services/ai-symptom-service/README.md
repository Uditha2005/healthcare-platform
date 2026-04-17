# AI Symptom Service

## Endpoint
- `POST /api/ai/check-symptoms`

## Sample Request
```json
{
  "symptoms": ["fever", "cough"],
  "age": 28,
  "gender": "female",
  "duration": "2 days",
  "notes": "mild sore throat"
}
```

## Sample Response
```json
{
  "suggestion": "Possible viral upper respiratory infection",
  "doctorType": "General Physician",
  "possibleConditions": ["Common cold", "Flu"],
  "urgency": "low",
  "homeCareAdvice": ["Hydrate", "Rest"],
  "warning": "This is not a medical diagnosis. Consult a licensed doctor for clinical decisions."
}
```
