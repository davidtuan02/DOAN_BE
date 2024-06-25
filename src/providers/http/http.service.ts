import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ErrorManager } from '../../utils/error-manager.util';

@Injectable()
export class HttpCustomService {
  constructor(private readonly httpService: HttpService) {}
  public async apiFindAll() {
    try {
      const response = await firstValueFrom(
        this.httpService.get('https://rickandmortyapi.com/api/character'),
      );
      return response.data;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }
}
