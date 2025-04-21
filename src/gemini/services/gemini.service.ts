import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GeminiService {
    private readonly GEMINI_API_KEY = 'AIzaSyD3hlTIQuEEi9p1NaC9CJMTI1HheAGpqnE';
    private readonly GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.GEMINI_API_KEY}`;
  
    async queryToSQL(query: string): Promise<string> {
      try {
        const response = await axios.post(this.GEMINI_URL, {
          contents: [
            {
              parts: [{ text: query }],
            },
          ],
        });
  
        const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
        return text || 'No se obtuvo respuesta del modelo';
      } catch (error) {
        console.error('Error al llamar a Gemini:', error.response?.data || error.message);
        throw new Error('Error al procesar la consulta con Gemini');
      }
    }
}
