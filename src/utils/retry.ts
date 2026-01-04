/**
 * A simple retry utility for async operations
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: {
        retries?: number;
        delay?: number;
        onRetry?: (error: any, attempt: number) => void;
    } = {},
): Promise<T> {
    const { retries = 3, delay = 1000, onRetry } = options;
    let lastError: any;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (attempt < retries) {
                if (onRetry) onRetry(error, attempt);
                await new Promise((resolve) => setTimeout(resolve, delay * attempt));
            }
        }
    }

    throw lastError;
}
