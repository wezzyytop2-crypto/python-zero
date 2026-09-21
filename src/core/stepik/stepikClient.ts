/**
 * Модуль интеграции со Stepik API (OAuth2 Client Credentials)
 * 
 * ВНИМАНИЕ: По умолчанию интеграция отключена.
 * Для включения:
 * 1. Зарегистрируйте OAuth2 приложение на странице https://stepik.org/oauth2/applications/
 *    (тип клиента: Confidential, Grant type: Client credentials).
 * 2. Добавьте в файл .env следующие переменные:
 *    VITE_STEPIK_ENABLED="true"
 *    VITE_STEPIK_CLIENT_ID="ваш_client_id"
 *    VITE_STEPIK_CLIENT_SECRET="ваш_client_secret"
 * 3. Перезапустите dev-сервер: npm run dev
 * 
 * Безопасность: Секреты хранятся только в переменных окружения и не коммитятся в git.
 * Примечание для GitHub Pages: Запросы к api.stepik.org из браузера напрямую могут требовать
 * настройки CORS Proxy при обращении из клиентского приложения.
 */

export interface StepikConfig {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  baseUrl: string;
}

export interface StepikCourse {
  id: number;
  title: string;
  summary: string;
  cover: string;
  learners_count: number;
}

export interface StepikLesson {
  id: number;
  title: string;
  steps: number[];
}

export interface StepikStep {
  id: number;
  lesson: number;
  position: number;
  status: string;
}

export const defaultStepikConfig: StepikConfig = {
  enabled: import.meta.env.VITE_STEPIK_ENABLED === 'true',
  clientId: import.meta.env.VITE_STEPIK_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_STEPIK_CLIENT_SECRET || '',
  baseUrl: 'https://stepik.org/api',
};

export class StepikApiClient {
  private config: StepikConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(config: StepikConfig = defaultStepikConfig) {
    this.config = config;
  }

  /**
   * Проверка: настроена ли интеграция со Stepik API
   */
  public isConfigured(): boolean {
    return this.config.enabled && !!this.config.clientId && !!this.config.clientSecret;
  }

  /**
   * Получение токена доступа по OAuth2 Client Credentials
   */
  public async authenticate(): Promise<string | null> {
    if (!this.isConfigured()) {
      return null;
    }

    // Если токен ещё действителен (с запасом 1 мин), используем его
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    try {
      const authHeader = btoa(`${this.config.clientId}:${this.config.clientSecret}`);
      const response = await fetch('https://stepik.org/oauth2/token/', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        throw new Error(`Stepik Auth error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiresAt = Date.now() + (data.expires_in * 1000);
      return this.accessToken;
    } catch (err) {
      console.warn('[StepikApi] Не удалось получить токен:', err);
      return null;
    }
  }

  /**
   * Получить метаданные курса по ID
   * @param courseId числовой ID курса Stepik
   */
  public async getCourse(courseId: number | string): Promise<StepikCourse | null> {
    const token = await this.authenticate();
    if (!token) return null;

    try {
      const response = await fetch(`${this.config.baseUrl}/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.courses?.[0] || null;
    } catch (e) {
      console.warn(`[StepikApi] Ошибка при запросе курса ${courseId}:`, e);
      return null;
    }
  }

  /**
   * Получить метаданные урока по ID
   * @param lessonId числовой ID урока Stepik
   */
  public async getLesson(lessonId: number | string): Promise<StepikLesson | null> {
    const token = await this.authenticate();
    if (!token) return null;

    try {
      const response = await fetch(`${this.config.baseUrl}/lessons/${lessonId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.lessons?.[0] || null;
    } catch (e) {
      console.warn(`[StepikApi] Ошибка при запросе урока ${lessonId}:`, e);
      return null;
    }
  }

  /**
   * Получить метаданные шагов (steps) по списку ID
   */
  public async getSteps(stepIds: number[]): Promise<StepikStep[]> {
    const token = await this.authenticate();
    if (!token || stepIds.length === 0) return [];

    try {
      const idsParam = stepIds.map(id => `ids[]=${id}`).join('&');
      const response = await fetch(`${this.config.baseUrl}/steps?${idsParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.steps || [];
    } catch (e) {
      console.warn('[StepikApi] Ошибка при запросе шагов:', e);
      return [];
    }
  }
}

export const stepikClient = new StepikApiClient();
