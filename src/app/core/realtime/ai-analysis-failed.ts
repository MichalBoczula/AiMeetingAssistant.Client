export interface AiAnalysisFailed {
  requestId: string;
  sessionId: string;
  status: 'failed';
  errorCode: string;
  message: string;
}
