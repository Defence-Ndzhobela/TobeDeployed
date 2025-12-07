# AI Billing Assistant Integration Guide

## Overview
The AI Billing Assistant page (`AIAssistant.tsx`) provides parents with:
- **AI Statement Summary**: Automatically generated explanation of monthly billing statements using OpenAI
- **AI Helpdesk**: Chat interface for answering billing-related questions
- **Randomized Mock Data**: Each session generates random billing data for testing

## Features Implemented

### 1. Randomized Mock Data
- Uses utility functions: `rand()`, `randomDate()`, `randomAmount()`
- Generates realistic billing scenarios with random:
  - Total statement amounts (₦35,000 - ₦50,000)
  - Individual fee amounts
  - Payment history dates
  - Outstanding balances

### 2. OpenAI Integration
- **Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Model**: `gpt-3.5-turbo`
- **API Key**: Stored in `.env.local` (NOT in code)

#### API Calls:
1. **Statement Summary**: Generates AI-powered explanation of billing statement
2. **Helpdesk Chat**: Processes user questions with billing context

### 3. Billing-Only Safety Filter
The AI system:
- ✅ Answers questions about fees, payments, balances
- ✅ Provides comparisons with previous months
- ✅ Explains statement changes
- ❌ Rejects non-billing questions
- 🔄 Escalates uncertain questions to bursar

## Configuration

### Environment Setup
Create `.env.local` in the frontend directory:
```env
VITE_OPENAI_API_KEY=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
VITE_OPENAI_API_URL=https://api.openai.com/v1/chat/completions
VITE_OPENAI_MODEL=gpt-3.5-turbo
```

### Configuration File
Location: `frontend/src/config/openaiConfig.ts`
- Reads from environment variables
- Falls back to defaults if not configured

## Usage

### For Parents:
1. Navigate to the "AI Billing Assistant" page
2. View auto-generated AI summary of statement
3. Ask questions in the helpdesk chat
4. Use quick suggestions or type custom questions

### Quick Suggestions:
- "Explain this month's fees"
- "Compare with last month"
- "Show outstanding balance"

## API Response Handling

### Statement Summary:
```typescript
// Calls OpenAI with statement data
// Returns: Natural language explanation
// Fallback: Mock summary if API fails
```

### Helpdesk Chat:
```typescript
// System prompt: Billing assistant role
// Context: Current student billing data
// Safety: Filters non-billing questions
// Error handling: Graceful fallback messages
```

## Error Handling

- **API Failures**: Falls back to mock responses
- **Network Issues**: Shows error message and suggests contacting bursar
- **Invalid Questions**: Politely redirects to billing topics

## Security Considerations

⚠️ **Important**: The API key is currently exposed in `.env.local`

**For Production:**
1. Move OpenAI calls to backend
2. Backend should have API key (never expose to frontend)
3. Frontend calls backend endpoint: `/api/ai/statement-summary`
4. Backend calls OpenAI securely
5. Return results to frontend

### Backend Implementation Example:
```python
@app.post("/api/ai/statement-summary")
def get_statement_summary(parent_id: str, statement_id: str):
    # Fetch statement data securely
    # Call OpenAI with API key
    # Return summary to frontend
    pass
```

## Testing

### Test Randomization:
- Reload page multiple times
- Verify different amounts appear each time

### Test OpenAI:
- Ask billing questions
- Verify responses are accurate
- Test non-billing questions (should be rejected)

### Test Fallbacks:
- Temporarily disconnect internet
- Verify mock responses display correctly

## Acceptance Criteria Met

✅ AI summary loads quickly  
✅ Accurate reflection of statement values  
✅ AI does not hallucinate fees  
✅ Parents can ask any billing question  
✅ Escalation works correctly  
✅ Randomized mock data for testing  
✅ OpenAI integration for real responses  
✅ Billing-only filter implemented  

## File Structure

```
frontend/
├── src/
│   ├── config/
│   │   └── openaiConfig.ts          # OpenAI configuration
│   └── pages/
│       └── AIAssistant.tsx          # Main component
└── .env.local                       # Environment variables
```

## Dependencies

- `axios`: HTTP client for API calls
- `lucide-react`: Icons
- `@radix-ui/*`: UI components
- `tailwindcss`: Styling

All already installed in the project.
