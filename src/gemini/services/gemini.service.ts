import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class GeminiService {
    private readonly geminiApiKey: string;
  private readonly geminiUrl: string;

  constructor(private configService: ConfigService) {
    this.geminiApiKey = this.configService.get<string>('GEMINI_API_KEY')!;
    this.geminiUrl = `${this.configService.get<string>('GEMINI_URL')}?key=${this.geminiApiKey}`;
  }
    async queryToSQL(query: string): Promise<string> {
      try {
        const response = await axios.post(this.geminiUrl, {
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
