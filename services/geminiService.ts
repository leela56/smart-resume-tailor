
// Frontend service - calls the Cloud Function API instead of Gemini directly
// This keeps the API key secure on the server side

export const tailorResume = async (
  resume: string,
  jobDescription: string,
  customPrompt: string,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
): Promise<void> => {
  try {
    // In production, this will call the Cloud Function
    // In development, we use the Vite proxy to forward to the local emulator or direct API
    const apiUrl = import.meta.env.PROD
      ? '/api/tailor'
      : '/api/tailor';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resume,
        jobDescription,
        customPrompt,
      }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error: ${response.status}`);
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      if (signal?.aborted) {
        reader.cancel();
        throw new Error('Tailoring stopped by user.');
      }

      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }

  } catch (error) {
    if (error instanceof Error && error.message === 'Tailoring stopped by user.') {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Tailoring stopped by user.');
    }
    console.error('Error calling tailor API:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to tailor resume. ${error.message}`);
    }
    throw new Error('Failed to tailor resume. An unknown error occurred.');
  }
};
