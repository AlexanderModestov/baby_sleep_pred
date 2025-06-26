const axios = require('axios');

async function predictNextSleep(childData, sleepHistory) {
  // Check if API key is configured
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_actual_api_key_here') {
    console.warn('Gemini API key not configured, returning mock prediction');
    const mockNextSleep = new Date(Date.now() + 3 * 60 * 60 * 1000);
    return {
      nextSleepTime: mockNextSleep.toISOString(),
      timeUntilSleep: "3 hours 0 minutes",
      expectedDuration: "2 hours 30 minutes",
      confidence: "medium",
      reasoning: "Mock prediction - Please configure your Gemini API key for AI-powered predictions"
    };
  }

  try {
    const currentTime = new Date();
    const ageInMonths = calculateAgeInMonths(childData.birth_date);
    
    const prompt = `You are a baby sleep expert. Based on the following information, predict the next optimal sleep time for this baby.

Child Information:
- Age: ${ageInMonths} months
- Gender: ${childData.gender}
- Current time: ${currentTime.toISOString()}

Recent Sleep History (last 7 sessions):
${sleepHistory.map(session => `
- Start: ${session.start_time}
- End: ${session.end_time || 'Still sleeping'}
- Quality: ${session.quality || 'Not rated'}
- Duration: ${session.end_time ? calculateDuration(session.start_time, session.end_time) : 'Ongoing'}
`).join('')}

Please provide your prediction in this exact JSON format:
{
  "nextSleepTime": "YYYY-MM-DDTHH:MM:SS.000Z",
  "timeUntilSleep": "X hours Y minutes",
  "expectedDuration": "X hours Y minutes",
  "confidence": "high/medium/low",
  "reasoning": "Brief explanation of your prediction"
}

Consider typical sleep patterns for babies of this age, the quality of recent sleep, and natural circadian rhythms. Base your prediction on established pediatric sleep guidelines.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const text = response.data.candidates[0].content.parts[0].text;
    
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      
      return {
        nextSleepTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        timeUntilSleep: "3 hours 0 minutes",
        expectedDuration: "2 hours 0 minutes",
        confidence: "low",
        reasoning: "Default prediction due to parsing error"
      };
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    
    const defaultNextSleep = new Date(Date.now() + 3 * 60 * 60 * 1000);
    return {
      nextSleepTime: defaultNextSleep.toISOString(),
      timeUntilSleep: "3 hours 0 minutes",
      expectedDuration: "2 hours 0 minutes",
      confidence: "low",
      reasoning: "Default prediction due to API error"
    };
  }
}

function calculateAgeInMonths(birthDate) {
  const birth = new Date(birthDate);
  const now = new Date();
  const diffTime = Math.abs(now - birth);
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
  return diffMonths;
}

function calculateDuration(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end - start;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours} hours ${minutes} minutes`;
}

module.exports = { predictNextSleep };