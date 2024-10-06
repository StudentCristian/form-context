"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface FormField {
  id: string;
  label: string;
  value: string;
}

const ContextualForm: React.FC = () => {
  const [fields, setFields] = useState<FormField[]>([
    { id: 'field1', label: 'Campo 1', value: '' },
    { id: 'field2', label: 'Campo 2', value: '' },
    { id: 'field3', label: 'Campo 3', value: '' },
  ]);
  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });
  const [activeFieldId, setActiveFieldId] = useState('');
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    const newPrompt = fields.map(field => `${field.label}: ${field.value}`).join('\n');
    setPrompt(newPrompt);
  }, [fields]);

  const handleInputChange = (id: string, value: string) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, value } : field
    ));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, fieldId: string) => {
    if (e.key === '@') {
      e.preventDefault();
      setShowSuggestions(true);
      setActiveFieldId(fieldId);
      setSelectedSuggestionIndex(0);
      const inputEl = e.target as HTMLInputElement;
      const rect = inputEl.getBoundingClientRect();
      setCursorPosition({
        top: rect.bottom,
        left: rect.left + inputEl.selectionStart! * 8,
      });
    } else if (showSuggestions) {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => (prev > 0 ? prev - 1 : fields.length - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => (prev < fields.length - 1 ? prev + 1 : 0));
          break;
        case 'Enter':
          e.preventDefault();
          insertReference(fields[selectedSuggestionIndex].id);
          break;
        case 'Escape':
          setShowSuggestions(false);
          break;
      }
    }
  };

  const insertReference = (referenceId: string) => {
    const activeField = fields.find(f => f.id === activeFieldId);
    if (activeField) {
      const inputEl = inputRefs.current[activeFieldId];
      if (inputEl) {
        const cursorPos = inputEl.selectionStart || 0;
        const textBeforeCursor = activeField.value.slice(0, cursorPos);
        const textAfterCursor = activeField.value.slice(cursorPos);
        const newValue = `${textBeforeCursor}@${referenceId}${textAfterCursor}`;
        handleInputChange(activeFieldId, newValue);
        setShowSuggestions(false);
        setTimeout(() => {
          inputEl.setSelectionRange(cursorPos + referenceId.length + 1, cursorPos + referenceId.length + 1);
          inputEl.focus();
        }, 0);
      }
    }
  };

  const generateAIResponse = () => {
    // Simulación de respuesta de IA
    const response = fields.map(field => {
      const references = fields.filter(f => field.value.includes(`@${f.id}`));
      if (references.length > 0) {
        return `En "${field.label}", se hace referencia a: ${references.map(r => r.label).join(', ')}. `;
      }
      return `"${field.label}" contiene: ${field.value}. `;
    }).join('\n');
    setAiResponse(`Respuesta generada basada en el formulario:\n\n${response}`);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Formulario Contextual</CardTitle>
      </CardHeader>
      <CardContent>
        {fields.map((field) => (
          <div key={field.id} className="mb-4">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              value={field.value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, field.id)}
              ref={(el) => inputRefs.current[field.id] = el}
              className="mt-1"
            />
          </div>
        ))}
        {showSuggestions && (
          <div
            style={{
              position: 'absolute',
              top: `${cursorPosition.top}px`,
              left: `${cursorPosition.left}px`,
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '8px',
              zIndex: 1000,
            }}
          >
            {fields.map((field, index) => (
              <div
                key={field.id}
                className={`cursor-pointer p-1 ${index === selectedSuggestionIndex ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                onClick={() => insertReference(field.id)}
              >
                {field.label}
              </div>
            ))}
          </div>
        )}
        <Button onClick={generateAIResponse} className="mt-4">Generar Respuesta IA</Button>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <Label htmlFor="prompt" className="mb-2">Prompt Generado:</Label>
        <textarea
          id="prompt"
          value={prompt}
          readOnly
          className="w-full h-32 p-2 border rounded mb-4"
        />
        <Label htmlFor="aiResponse" className="mb-2">Respuesta generada por IA:</Label>
        <textarea
          id="aiResponse"
          value={aiResponse}
          readOnly
          className="w-full h-48 p-2 border rounded"
        />
      </CardFooter>
    </Card>
  );
};

export default ContextualForm;