import React, { useState } from 'react';
import API from '../../services/api';

const formatAiResponse = (data) => {
  const conditions = Array.isArray(data?.possibleConditions) && data.possibleConditions.length > 0
    ? data.possibleConditions.join(', ')
    : 'No likely conditions listed';

  const advice = Array.isArray(data?.homeCareAdvice) && data.homeCareAdvice.length > 0
    ? data.homeCareAdvice.map((item) => `- ${item}`).join('\n')
    : '- Stay hydrated\n- Rest and monitor symptoms';

  return [
    `Suggestion: ${data?.suggestion || 'No suggestion available'}`,
    `Doctor Type: ${data?.doctorType || 'General Physician'}`,
    `Urgency: ${(data?.urgency || 'medium').toUpperCase()}`,
    `Possible Conditions: ${conditions}`,
    '',
    'Home Care Advice:',
    advice,
    '',
    `Warning: ${data?.warning || 'This is not a diagnosis. Please consult a doctor.'}`
  ].join('\n');
};

const extractSymptoms = (text) => {
  const list = text
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (list.length === 0) return [];
  if (list.length === 1) return [list[0]];
  return list;
};

const AISymptomChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: 'Hi! I can help assess your symptoms. Try: fever, sore throat, headache.'
    }
  ]);

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        text: 'Hi! I can help assess your symptoms. Try: fever, sore throat, headache.'
      }
    ]);
    setInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const raw = input.trim();
    if (!raw) return;

    const symptoms = extractSymptoms(raw);
    if (symptoms.length === 0) return;

    const userMessage = { id: Date.now(), role: 'user', text: raw };
    const pendingId = Date.now() + 1;

    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: pendingId, role: 'assistant', text: 'Checking your symptoms...', pending: true }
    ]);

    setInput('');
    setLoading(true);

    try {
      const res = await API.post('/ai/check-symptoms', {
        symptoms,
        notes: raw
      });

      const resultText = formatAiResponse(res.data);
      setMessages((prev) => prev.map((msg) => (
        msg.id === pendingId ? { ...msg, text: resultText, pending: false } : msg
      )));
    } catch (err) {
      const apiMessage = err.response?.data?.message;
      const apiError = err.response?.data?.error;
      const errorText = apiMessage && apiError
        ? `${apiMessage}: ${apiError}`
        : (apiMessage || apiError || 'Unable to analyze symptoms right now.');
      setMessages((prev) => prev.map((msg) => (
        msg.id === pendingId ? { ...msg, text: `Error: ${errorText}`, pending: false } : msg
      )));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div style={styles.panel}>
          <div style={styles.header}>
            <div>
              <h3 style={styles.title}>AI Symptom Assistant</h3>
              <p style={styles.subTitle}>Guidance only, not a diagnosis</p>
            </div>
            <div style={styles.headerBtns}>
              <button style={styles.smallBtn} onClick={clearChat}>Clear</button>
              <button style={styles.smallBtn} onClick={() => setOpen(false)}>Close</button>
            </div>
          </div>

          <div style={styles.body}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  ...styles.message,
                  ...(msg.role === 'user' ? styles.userMessage : styles.assistantMessage),
                  ...(msg.pending ? styles.pending : {})
                }}
              >
                <pre style={styles.messageText}>{msg.text}</pre>
              </div>
            ))}
          </div>

          <form style={styles.form} onSubmit={handleSubmit}>
            <textarea
              rows={2}
              style={styles.input}
              placeholder="Type symptoms separated by commas"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button style={styles.sendBtn} type="submit" disabled={loading || !input.trim()}>
              {loading ? 'Checking...' : 'Send'}
            </button>
          </form>
        </div>
      )}

      <button style={styles.bubble} onClick={() => setOpen((prev) => !prev)} aria-label="Open symptom assistant">
        {open ? 'x' : 'AI'}
      </button>
    </>
  );
};

const styles = {
  bubble: {
    position: 'fixed',
    right: '20px',
    bottom: '20px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: 'none',
    background: 'linear-gradient(135deg, #0891b2, #2563eb)',
    color: '#fff',
    fontSize: '22px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 10px 24px rgba(37, 99, 235, 0.35)',
    zIndex: 1000
  },
  panel: {
    position: 'fixed',
    right: '20px',
    bottom: '90px',
    width: '370px',
    maxWidth: 'calc(100vw - 32px)',
    height: '520px',
    background: '#fff',
    borderRadius: '14px',
    boxShadow: '0 14px 36px rgba(0,0,0,0.18)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 1000
  },
  header: {
    background: '#1d4ed8',
    color: '#fff',
    padding: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px'
  },
  title: {
    margin: 0,
    fontSize: '16px'
  },
  subTitle: {
    margin: '4px 0 0',
    fontSize: '12px',
    opacity: 0.9
  },
  headerBtns: {
    display: 'flex',
    gap: '6px'
  },
  smallBtn: {
    border: '1px solid rgba(255,255,255,0.45)',
    background: 'transparent',
    color: '#fff',
    borderRadius: '8px',
    padding: '6px 10px',
    cursor: 'pointer'
  },
  body: {
    flex: 1,
    padding: '12px',
    overflowY: 'auto',
    background: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  message: {
    maxWidth: '90%',
    padding: '10px 12px',
    borderRadius: '10px'
  },
  userMessage: {
    alignSelf: 'flex-end',
    background: '#2563eb',
    color: '#fff'
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    background: '#e2e8f0',
    color: '#0f172a'
  },
  pending: {
    opacity: 0.8,
    fontStyle: 'italic'
  },
  messageText: {
    margin: 0,
    whiteSpace: 'pre-wrap',
    fontSize: '13px',
    lineHeight: 1.45,
    fontFamily: 'inherit'
  },
  form: {
    padding: '10px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    gap: '8px',
    background: '#fff'
  },
  input: {
    flex: 1,
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '10px',
    resize: 'none',
    fontFamily: 'inherit',
    fontSize: '13px'
  },
  sendBtn: {
    border: 'none',
    borderRadius: '8px',
    background: '#16a34a',
    color: '#fff',
    padding: '0 14px',
    cursor: 'pointer',
    fontWeight: 600
  }
};

export default AISymptomChatWidget;
