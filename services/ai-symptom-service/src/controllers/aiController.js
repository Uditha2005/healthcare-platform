const extractJsonObject = (text) => {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (err) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    try {
      return JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      return null;
    }
  }
};

const getCandidateText = (responseData) => {
  const parts = responseData?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';

  return parts
    .map((part) => (typeof part?.text === 'string' ? part.text : ''))
    .join('\n')
    .trim();
};

const buildPrompt = ({ symptoms, age, gender, duration, notes }) => {
  return [
    'You are a clinical triage assistant for a telemedicine platform.',
    'Provide only educational guidance and never a definitive diagnosis.',
    'Return STRICT JSON only with keys:',
    'suggestion (string), doctorType (string), possibleConditions (array of up to 3 strings), urgency (low|medium|high), homeCareAdvice (array of strings), warning (string).',
    'Keep all string values concise. Keep each homeCareAdvice item under 12 words.',
    'If symptoms suggest emergency risk, set urgency to high and warning to seek emergency care immediately.',
    '',
    `Symptoms: ${symptoms.join(', ')}`,
    `Age: ${age || 'not provided'}`,
    `Gender: ${gender || 'not provided'}`,
    `Duration: ${duration || 'not provided'}`,
    `Additional notes: ${notes || 'none'}`
  ].join('\n');
};

exports.checkSymptoms = async (req, res) => {
  try {
    const { symptoms, age, gender, duration, notes } = req.body;

    if (!Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ message: 'symptoms must be a non-empty array of strings' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is not configured' });
    }

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const baseUrl = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';

    const prompt = buildPrompt({ symptoms, age, gender, duration, notes });

    const requestPayload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 250,
        responseMimeType: 'application/json',
        thinkingConfig: {
          thinkingBudget: 0
        }
      }
    };

    const requestGemini = async (modelName) => {
      const endpoint = `${baseUrl}/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });

      const data = await response.json();
      return { response, data };
    };

    let { response, data } = await requestGemini(model);

    const modelMissing =
      !response.ok &&
      typeof data?.error?.message === 'string' &&
      data.error.message.includes('is not found');
    const isOverloaded =
      !response.ok &&
      typeof data?.error?.message === 'string' &&
      data.error.message.toLowerCase().includes('high demand');

    if (modelMissing && model !== 'gemini-2.5-flash') {
      ({ response, data } = await requestGemini('gemini-2.5-flash'));
    }

    if (isOverloaded && model !== 'gemini-2.5-pro') {
      ({ response, data } = await requestGemini('gemini-2.5-pro'));
    }

    if (!response.ok) {
      return res.status(response.status).json({
        message: 'Gemini request failed',
        error: data?.error?.message || 'Unknown Gemini error'
      });
    }

    const content = getCandidateText(data);
    let parsed = extractJsonObject(content);

    if (!parsed) {
      const compactPrompt = [
        'Return STRICT JSON only with this exact schema:',
        '{"suggestion":"","doctorType":"","possibleConditions":[],"urgency":"","homeCareAdvice":[],"warning":""}',
        'Rules:',
        '- Keep suggestion and warning short.',
        '- urgency must be low, medium, or high.',
        '- possibleConditions max 3 items.',
        '- homeCareAdvice max 3 items.',
        '',
        `Symptoms: ${symptoms.join(', ')}`,
        `Age: ${age || 'not provided'}`,
        `Gender: ${gender || 'not provided'}`,
        `Duration: ${duration || 'not provided'}`,
        `Additional notes: ${notes || 'none'}`
      ].join('\n');

      const compactPayload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: compactPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 180,
          responseMimeType: 'application/json',
          thinkingConfig: {
            thinkingBudget: 0
          }
        }
      };

      const compactEndpoint = `${baseUrl}/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const compactResponse = await fetch(compactEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(compactPayload)
      });

      if (compactResponse.ok) {
        const compactData = await compactResponse.json();
        const compactContent = getCandidateText(compactData);
        parsed = extractJsonObject(compactContent);
      }
    }

    if (!parsed) {
      return res.status(502).json({
        message: 'Unable to parse AI response',
        raw: content || null
      });
    }

    return res.status(200).json({
      suggestion: parsed.suggestion || 'No suggestion available',
      doctorType: parsed.doctorType || 'General Physician',
      possibleConditions: Array.isArray(parsed.possibleConditions) ? parsed.possibleConditions : [],
      urgency: parsed.urgency || 'medium',
      homeCareAdvice: Array.isArray(parsed.homeCareAdvice) ? parsed.homeCareAdvice : [],
      warning: parsed.warning || 'This is not a medical diagnosis. Consult a licensed doctor for clinical decisions.'
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Unable to process symptom check',
      error: err.message
    });
  }
};
