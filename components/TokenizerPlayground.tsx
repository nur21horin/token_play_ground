
'use client';

import { useEffect, useRef, useState } from 'react';
import { AutoTokenizer } from '@huggingface/transformers';

const MODELS = [
  {
    name: 'BERT Base Cased',
    id: 'Xenova/bert-base-cased',
  },
  {
    name: 'GPT-2',
    id: 'Xenova/gpt2',
  },
  {
    name: 'Llama 3',
    id: 'Xenova/llama-3-tokenizer',
  },
  {
    name: 'Gemma',
    id: 'Xenova/gemma-tokenizer',
  },
  {
    name: 'Mistral',
    id: 'Xenova/mistral-tokenizer-v3',
  },
];

type TokenResult = {
  id: number;
  text: string;
};

export default function TokenizerPlayground() {
  const tokenizerRef = useRef<any>(null);

  const [modelId, setModelId] = useState(MODELS[0].id);
  const [customModel, setCustomModel] = useState('');

  const [text, setText] = useState(
    'Hello! Welcome to Tokenizer Playground.'
  );

  const [tokens, setTokens] = useState<TokenResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Ready');

  const [view, setView] = useState<'text' | 'ids' | 'hide'>('text');

  // Load selected tokenizer.
  useEffect(() => {
    let cancelled = false;

    async function loadTokenizer() {
      tokenizerRef.current = null;

      setTokens([]);
      setError('');
      setLoading(true);
      setStatus('Loading tokenizer...');

      try {
        const loaded = await AutoTokenizer.from_pretrained(modelId);

        if (cancelled) return;

        tokenizerRef.current = loaded;

        setStatus('Tokenizer loaded successfully!');

        // Tokenize current input after loading.
        processText(text, loaded);
      } catch (err) {
        console.error('Tokenizer loading error:', err);

        if (!cancelled) {
          setError('Unable to load this model. Check its Hugging Face ID.');
          setStatus('Loading failed');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTokenizer();

    return () => {
      cancelled = true;
      tokenizerRef.current = null;
    };
  }, [modelId]);

  // Tokenization function.
  function processText(value: string, activeTokenizer: any) {
    if (typeof value !== 'string' || !activeTokenizer) return;

    if (!value.trim()) {
      setTokens([]);
      setError('');
      return;
    }

    try {
      const result = activeTokenizer(value);

      const ids: number[] = Array.from(
        result.input_ids.data,
        (item: number | bigint) => Number(item)
      );

      const tokenResults: TokenResult[] = ids.map((id) => ({
        id,
        text: activeTokenizer.decode([id], {
          skip_special_tokens: false,
        }),
      }));

      setTokens(tokenResults);
      setError('');
    } catch (err) {
      console.error('Tokenization error:', err);
      setError('Tokenization failed. Please try another text.');
    }
  }

  // Handle text input.
  function handleTextChange(value: string) {
    setText(value);

    if (tokenizerRef.current) {
      processText(value, tokenizerRef.current);
    }
  }

  // Load custom model.
  function handleCustomModel() {
    const id = customModel.trim();

    if (!id) {
      setError('Enter a Hugging Face model ID.');
      return;
    }

    setModelId(id);
  }

  // Clear text.
  function handleClear() {
    setText('');
    setTokens([]);
    setError('');
  }

  const characterCount = text.length;

  const wordCount = text.trim()
    ? text.trim().split(/\s+/).length
    : 0;

  const colors = [
    'token-blue',
    'token-green',
    'token-yellow',
    'token-purple',
    'token-pink',
    'token-teal',
  ];

  return (
    <main className="playground">
      <header className="header">
        <p className="eyebrow">AI DEVELOPER TOOL</p>
        <h1>Tokenizer Playground</h1>
        <p>Explore how different AI models tokenize text.</p>
      </header>

      <section className="section">
        <label className="section-label" htmlFor="model">
          Select Model
        </label>

        <select
          id="model"
          className="model-select"
          value={modelId}
          onChange={(e) => setModelId(e.target.value)}
        >
          {MODELS.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>

        <div className="custom-model">
          <label className="section-label" htmlFor="customModel">
            Custom Hugging Face Model ID
          </label>

          <div className="label-row">
            <input
              id="customModel"
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
              placeholder="username/model-name"
            />

            <button onClick={handleCustomModel}>
              Load Model
            </button>
          </div>
        </div>

        <div className="status">
          {loading ? (
            <span className="loading">{status}</span>
          ) : error ? (
            <span className="error">{status}</span>
          ) : (
            <span>{status}</span>
          )}
        </div>

        <p className="muted">Model ID: {modelId}</p>
      </section>

      <section className="section">
        <div className="label-row">
          <label className="section-label" htmlFor="inputText">
            Enter your text
          </label>

          <button className="clear-button" onClick={handleClear}>
            Clear
          </button>
        </div>

        <textarea
          id="inputText"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Type something here..."
          rows={6}
        />

        <div className="stats">
          <div className="stat-card">
            <span>Tokens</span>
            <strong>{tokens.length}</strong>
          </div>

          <div className="stat-card">
            <span>Characters</span>
            <strong>{characterCount}</strong>
          </div>

          <div className="stat-card">
            <span>Words</span>
            <strong>{wordCount}</strong>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="label-row">
          <h2 className="section-label">Token Visualization</h2>

          <div className="view-controls">
            <button
              className={view === 'text' ? 'active-view' : ''}
              onClick={() => setView('text')}
            >
              Text
            </button>

            <button
              className={view === 'ids' ? 'active-view' : ''}
              onClick={() => setView('ids')}
            >
              Token IDs
            </button>

            <button
              className={view === 'hide' ? 'active-view' : ''}
              onClick={() => setView('hide')}
            >
              Hide
            </button>
          </div>
        </div>

        <div className="output-box">
          {loading ? (
            <p className="muted">Loading tokenizer...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : view === 'hide' ? (
            <p className="muted">Visualization hidden.</p>
          ) : tokens.length === 0 ? (
            <p className="muted">Enter text to see tokens.</p>
          ) : view === 'ids' ? (
            <div className="ids-output">
              {tokens.map((token, index) => (
                <span className="token" key={index}>
                  {token.id}
                </span>
              ))}
            </div>
          ) : (
            <div className="tokens">
              {tokens.map((token, index) => (
                <span
                  key={index}
                  className={`token ${colors[index % colors.length]}`}
                  title={`Token ID: ${token.id}`}
                >
                  {token.text}
                </span>
              ))}
            </div>
          )}
        </div>

        <p className="muted">Total tokens: {tokens.length}</p>
      </section>

      <footer className="footer">
        Built with Next.js, React and Hugging Face Transformers.js.
      </footer>
    </main>
  );
}
