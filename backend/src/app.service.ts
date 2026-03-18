import { Injectable } from '@nestjs/common';
import * as moment from 'moment';

export interface HealthResponse {
  status: 'ok';
  service: string;
  timestamp: string;
}

@Injectable()
export class AppService {
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'font-ninja-backend',
      timestamp: moment.utc().toISOString(),
    };
  }
}
